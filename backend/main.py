"""People & Teams prototype - FastAPI backend (researcher search + profile).

All API endpoints and SQL queries live in this single file, mirroring the
architecture of the other group's prototype. Run with:

    uvicorn main:app --reload --port 8000

The JSON is camelCase and has the same shape as frontend/src/types/researcher.ts.
UI texts (labels such as "Research topics") stay in the frontend: the API only
returns data (field names, values, counts).

Search is computed in Python over rows loaded with SQL. This keeps the rules
identical to the ones the frontend used with its mock data (data/profile.ts),
which is fine for a prototype with a small data set.
"""

import os
from contextlib import contextmanager

import psycopg2
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/people_teams"
)
# The frontend is a Module Federation remote: its code runs in the page of the
# host app, so the browser sends the host's origin. By default we accept the
# same origins as frontend/rsbuild.config.ts (localhost / 127.0.0.1, ports
# 3000-3006; the remote itself runs on 3006). Override with CORS_ORIGIN_REGEX,
# or add exact origins (comma separated) with CORS_ORIGINS.
CORS_ORIGIN_REGEX = os.getenv(
    "CORS_ORIGIN_REGEX", r"^http://(localhost|127\.0\.0\.1):300[0-6]$"
)
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

SUGGESTION_CAP = 8

app = FastAPI(title="People & Teams API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_methods=["GET"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

@contextmanager
def get_cursor():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            yield cur
    finally:
        conn.close()


def fetch_all(sql: str, params: tuple = ()):
    with get_cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchall()


def fetch_one(sql: str, params: tuple = ()):
    with get_cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchone()


# One row per researcher with everything the search needs. Topics are ordered
# by topic id and completed projects by project id (same order as the mock).
RESEARCHER_ROWS_SQL = """
    SELECT r.id, r.name, r.role, r.member_status,
           COALESCE(t.name, '') AS team_name,
           COALESCE(r.skills, '{}') AS skills,
           COALESCE(r.research_history, '{}') AS research_history,
           COALESCE((SELECT array_agg(rt.name ORDER BY rt.id)::text[]
                       FROM researcher_topics x
                       JOIN research_topics rt ON rt.id = x.topic_id
                      WHERE x.researcher_id = r.id), '{}') AS topics,
           COALESCE((SELECT json_agg(json_build_object('id', p.id, 'name', p.name)
                                     ORDER BY p.id)
                       FROM researcher_project_assignments a
                       JOIN projects p ON p.id = a.project_id
                      WHERE a.researcher_id = r.id
                        AND p.status = 'completed'), '[]'::json) AS completed_projects
    FROM researchers r
    LEFT JOIN teams t ON t.id = r.team_id
    ORDER BY r.id
"""

LINKED_TOPICS_SQL = """
    SELECT DISTINCT rt.id, rt.name
    FROM researcher_topics x
    JOIN research_topics rt ON rt.id = x.topic_id
    ORDER BY rt.id
"""

COMPLETED_PROJECTS_SQL = """
    SELECT id, name FROM projects WHERE status = 'completed' ORDER BY id
"""


# ---------------------------------------------------------------------------
# Search rules (same behaviour as frontend/src/data/profile.ts)
# ---------------------------------------------------------------------------

def fold(value: str) -> str:
    return value.lower()


def matched_strings(values: list[str], folded_query: str) -> list[str]:
    if folded_query == "":
        return []
    return [value for value in values if folded_query in fold(value)]


def holds_any(values: list[str], selected: list[str]) -> bool:
    if not selected:
        return True
    folded = {fold(value) for value in values}
    return any(fold(value) in folded for value in selected)


def reason_values(stored: list[str], text_matched: list[str], selected: list[str]):
    text = {fold(value) for value in text_matched}
    picked = {fold(value) for value in selected}
    return [value for value in stored if fold(value) in text or fold(value) in picked]


def previous_project_names(completed_projects: list[dict], completed) -> list[str]:
    """Names of the completed projects selected by the 'completed' filter."""
    if completed == "all":
        return []
    if completed == "any":
        return [project["name"] for project in completed_projects]
    ids = set(completed)
    return [p["name"] for p in completed_projects if p["id"] in ids]


def run_search(rows, query, topics, skills, history, completed) -> list[dict]:
    """completed is "all", "any" or a list of completed project ids."""
    folded_query = fold(query.strip())
    hits = []
    for row in rows:
        previous_names = previous_project_names(row["completed_projects"], completed)
        if completed != "all" and not previous_names:
            continue
        if not holds_any(row["topics"], topics):
            continue
        if not holds_any(row["skills"], skills):
            continue
        if not holds_any(row["research_history"], history):
            continue

        topic_hits = matched_strings(row["topics"], folded_query)
        skill_hits = matched_strings(row["skills"], folded_query)
        history_hits = matched_strings(row["research_history"], folded_query)
        name_matches = folded_query != "" and folded_query in fold(row["name"])
        text_matches = (
            folded_query == ""
            or name_matches
            or topic_hits
            or skill_hits
            or history_hits
        )
        if not text_matches:
            continue

        reasons = []
        for field, stored, text_hits, selected in (
            ("topic", row["topics"], topic_hits, topics),
            ("skill", row["skills"], skill_hits, skills),
            ("history", row["research_history"], history_hits, history),
        ):
            values = reason_values(stored, text_hits, selected)
            if values:
                reasons.append({"field": field, "values": values})
        if completed != "all":
            reasons.append({"field": "previousProject", "values": previous_names})

        hits.append(
            {
                "id": row["id"],
                "name": row["name"],
                "role": row["role"],
                "teamName": row["team_name"],
                "memberStatus": row["member_status"],
                "reasons": reasons,
            }
        )
    return hits


def unique_labels(groups: list[list[str]]) -> list[str]:
    seen: set[str] = set()
    labels = []
    for group in groups:
        for label in group:
            key = fold(label)
            if key in seen:
                continue
            seen.add(key)
            labels.append(label)
    return labels


def build_facet_catalog(rows, linked_topics, completed_projects, query, filters):
    def count(**override) -> int:
        selection = {**filters, **override}
        return len(
            run_search(
                rows,
                query,
                selection["topics"],
                selection["skills"],
                selection["history"],
                selection["completed"],
            )
        )

    return {
        "topics": [
            {"value": t["name"], "label": t["name"], "count": count(topics=[t["name"]])}
            for t in linked_topics
        ],
        "skills": [
            {"value": label, "label": label, "count": count(skills=[label])}
            for label in unique_labels([row["skills"] for row in rows])
        ],
        "history": [
            {"value": label, "label": label, "count": count(history=[label])}
            for label in unique_labels([row["research_history"] for row in rows])
        ],
        # The label ("Any completed project") is UI text, added by the frontend.
        "anyCompleted": {"value": "any", "count": count(completed="any")},
        "projects": [
            {
                "value": str(p["id"]),
                "label": p["name"],
                "count": count(completed=[p["id"]]),
            }
            for p in completed_projects
        ],
    }


def build_suggestions(rows, linked_topics, completed_projects, query) -> list[dict]:
    folded_query = fold(query.strip())
    if folded_query == "":
        return []

    candidates = (
        [("name", row["name"]) for row in rows]
        + [("topic", t["name"]) for t in linked_topics]
        + [("skill", label) for row in rows for label in row["skills"]]
        + [("history", label) for row in rows for label in row["research_history"]]
        + [("previousProject", p["name"]) for p in completed_projects]
    )

    seen: set[str] = set()
    suggestions = []
    for field, label in candidates:
        # Same matching rule as the frontend: it matches against "field:label".
        key = f"{field}:{fold(label)}"
        if key in seen:
            continue
        seen.add(key)
        if folded_query not in key:
            continue
        suggestions.append({"field": field, "label": label})
        if len(suggestions) == SUGGESTION_CAP:
            break
    return suggestions


# ---------------------------------------------------------------------------
# Query-string parsing
# ---------------------------------------------------------------------------

def clean(values: list[str]) -> list[str]:
    return [value for value in values if value != ""]


def parse_completed(values: list[str]):
    """'all' (default), 'any' or one or more completed project ids."""
    values = clean(values)
    if values == [] or values == ["all"]:
        return "all"
    if values == ["any"]:
        return "any"
    try:
        return [int(value) for value in values]
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="completed must be 'all', 'any' or one or more project ids",
        )


def load_search_context():
    return (
        fetch_all(RESEARCHER_ROWS_SQL),
        fetch_all(LINKED_TOPICS_SQL),
        fetch_all(COMPLETED_PROJECTS_SQL),
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    fetch_one("SELECT 1 AS ok")
    return {"status": "ok"}


# The fixed paths must be declared before /api/researchers/{researcher_id}.

@app.get("/api/researchers")
def search_researchers(
    query: str = "",
    topics: list[str] = Query(default=[]),
    skills: list[str] = Query(default=[]),
    history: list[str] = Query(default=[]),
    completed: list[str] = Query(default=[]),
):
    """SearchHit[]: text search plus facet filters.

    Lists are repeated parameters (?topics=A&topics=B). completed is "all",
    "any" or one or more completed project ids (?completed=3&completed=4).
    """
    return run_search(
        fetch_all(RESEARCHER_ROWS_SQL),
        query,
        clean(topics),
        clean(skills),
        clean(history),
        parse_completed(completed),
    )


@app.get("/api/researchers/facets")
def facet_catalog(
    query: str = "",
    topics: list[str] = Query(default=[]),
    skills: list[str] = Query(default=[]),
    history: list[str] = Query(default=[]),
    completed: list[str] = Query(default=[]),
):
    """FacetCatalog: every facet value with the result count it would give."""
    rows, linked_topics, completed_projects = load_search_context()
    filters = {
        "topics": clean(topics),
        "skills": clean(skills),
        "history": clean(history),
        "completed": parse_completed(completed),
    }
    return build_facet_catalog(rows, linked_topics, completed_projects, query, filters)


@app.get("/api/researchers/suggestions")
def search_suggestions(query: str = ""):
    """SearchSuggestion[]: autocomplete for the search bar."""
    rows, linked_topics, completed_projects = load_search_context()
    return build_suggestions(rows, linked_topics, completed_projects, query)


@app.get("/api/researchers/summary")
def researchers_summary():
    """Totals used by the result summary and the empty-state message."""
    rows = fetch_all(RESEARCHER_ROWS_SQL)
    return {
        "total": len(rows),
        "withCompletedProjects": sum(1 for row in rows if row["completed_projects"]),
    }


@app.get("/api/researchers/{researcher_id}")
def get_researcher_profile(researcher_id: int):
    """ResearcherProfile, or 404 when there is no such researcher."""
    researcher = fetch_one(
        """
        SELECT id, name, role, member_status, employment_type, team_id,
               COALESCE(skills, '{}') AS skills,
               COALESCE(research_history, '{}') AS research_history
        FROM researchers
        WHERE id = %s
        """,
        (researcher_id,),
    )
    if researcher is None:
        raise HTTPException(status_code=404, detail="Researcher not found")
    if researcher["team_id"] is None:
        raise HTTPException(status_code=500, detail="Researcher has no team")

    team = fetch_one(
        """
        SELECT id, name, COALESCE(description, '') AS description, status, leader_id
        FROM teams
        WHERE id = %s
        """,
        (researcher["team_id"],),
    )
    leader = None
    if team["leader_id"] is not None:
        leader = fetch_one(
            "SELECT id, name, role FROM researchers WHERE id = %s",
            (team["leader_id"],),
        )
    if leader is None:
        raise HTTPException(status_code=500, detail="Team has no leader")

    researcher_topics = fetch_all(
        """
        SELECT rt.name
        FROM researcher_topics x
        JOIN research_topics rt ON rt.id = x.topic_id
        WHERE x.researcher_id = %s
        ORDER BY rt.id
        """,
        (researcher_id,),
    )
    team_topics = fetch_all(
        """
        SELECT rt.name
        FROM team_topics x
        JOIN research_topics rt ON rt.id = x.topic_id
        WHERE x.team_id = %s
        ORDER BY rt.id
        """,
        (team["id"],),
    )
    colleagues = fetch_all(
        """
        SELECT id, name, role
        FROM researchers
        WHERE team_id = %s AND id <> %s
        ORDER BY id
        """,
        (team["id"], researcher_id),
    )
    # A researcher may have several contracts: show the most recent one.
    # The profile page needs both dates, so a contract without them counts as
    # "no contract on file".
    contract = fetch_one(
        """
        SELECT type, start_date, end_date
        FROM researcher_contracts
        WHERE researcher_id = %s
          AND start_date IS NOT NULL AND end_date IS NOT NULL
        ORDER BY start_date DESC, id DESC
        LIMIT 1
        """,
        (researcher_id,),
    )
    projects = fetch_all(
        """
        SELECT p.id, p.name, p.status, a.allocation_percentage
        FROM researcher_project_assignments a
        JOIN projects p ON p.id = a.project_id
        WHERE a.researcher_id = %s
        ORDER BY p.id
        """,
        (researcher_id,),
    )

    return {
        "id": researcher["id"],
        "name": researcher["name"],
        "role": researcher["role"],
        "memberStatus": researcher["member_status"],
        "employmentType": researcher["employment_type"],
        "skills": researcher["skills"],
        "topics": [row["name"] for row in researcher_topics],
        "researchHistory": researcher["research_history"],
        "team": {
            "id": team["id"],
            "name": team["name"],
            "description": team["description"],
            "status": team["status"],
            "topics": [row["name"] for row in team_topics],
            "leader": {
                "id": leader["id"],
                "name": leader["name"],
                "role": leader["role"],
                "isSelf": leader["id"] == researcher["id"],
            },
        },
        "colleagues": [
            {"id": row["id"], "name": row["name"], "role": row["role"]}
            for row in colleagues
        ],
        "contract": None
        if contract is None
        else {
            "type": contract["type"],
            "startDate": contract["start_date"].isoformat(),
            "endDate": contract["end_date"].isoformat(),
        },
        "projects": [
            {
                "id": row["id"],
                "name": row["name"],
                "status": row["status"],
                "allocationPercentage": row["allocation_percentage"],
            }
            for row in projects
        ],
    }
