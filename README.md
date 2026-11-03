# People & Teams Prototype

React frontend, FastAPI backend and PostgreSQL database.

```
database/   init.sql   -> schema + sample data
backend/    main.py    -> FastAPI app (all endpoints and SQL queries)
frontend/   src/       -> React + TypeScript (Rsbuild, Module Federation remote)
```

## User stories:

**Search and Filter Researchers by Expertise and Projects (GitHub `#72`):** 

"As a user, I want to search and filter researchers by name, research topic, skill, technological expertise or previous project, so that I can find relevant colleagues, potential collaborators and people suited to a project or research challenge."

**View Detailed Researcher Profile and Expertise (GitHub `#73`):**

"As a user, I want to view a researcher’s profile, including their skills, role, team, research topics and research history, so that I can understand their expertise and experience."

## Run the database and the API

```bash
docker compose up --build
```

- API: http://localhost:8000
- Interactive docs (Swagger): http://localhost:8000/docs
- PostgreSQL: `localhost:5432` (user/password `postgres`, database `people_teams`)

`database/init.sql` only runs when the database volume is created. After changing
it, reset with `docker compose down -v && docker compose up --build`.

## Run the frontend against the API

```bash
cd frontend
cp .env.example .env     # PUBLIC_USE_MOCK=false, PUBLIC_API_BASE=http://localhost:8000/api
npm install
npm run dev              # http://localhost:3006
```

With `PUBLIC_USE_MOCK` unset (or anything other than `false`) the frontend keeps
using the in-memory mock data, so it also runs without the backend.

The frontend is a Module Federation remote, so its code runs in the page of the
host app. The backend accepts requests from `localhost` / `127.0.0.1` on ports
3000-3006 (the same range as `frontend/rsbuild.config.ts`). For other origins set
`CORS_ORIGINS` (comma separated) or `CORS_ORIGIN_REGEX` on the backend.

## Run the backend without Docker (optional)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/people_teams
uvicorn main:app --reload --port 8000
```

## API endpoints

JSON is camelCase and matches `frontend/src/types/researcher.ts`. UI texts stay in
the frontend (`copy.ts`); the API only returns data.

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/researchers/{id}` | Researcher profile (team, leader, colleagues, topics, contract, projects); 404 if missing |
| GET | `/api/researchers?query=&topics=&skills=&history=&completed=` | Search hits with the reasons they matched |
| GET | `/api/researchers/facets?...` | Facet values with result counts (same parameters as the search) |
| GET | `/api/researchers/suggestions?query=` | Search-bar suggestions |
| GET | `/api/researchers/summary` | Total researchers and how many have a completed project |

Search parameters: `topics`, `skills` and `history` are repeated
(`?topics=A&topics=B`). `completed` is `all` (default), `any`, or one or more
completed project ids (`?completed=3&completed=4`).
