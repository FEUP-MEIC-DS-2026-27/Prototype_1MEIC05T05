# People & Teams Prototype

React frontend, FastAPI backend and PostgreSQL database.

**User story:** View Detailed Researcher Profile and Expertise (GitHub `#73`).

## Repository layout

```
PEOPLE-AND-TEAMS-PROTOTYPE_TxxGyy/
├── docker-compose.yml
├── README.md
├── .gitignore
│
├── database/
│   └── init.sql                     Creates the tables and inserts the sample data
│
├── backend/
│   ├── main.py                      FastAPI app: all API endpoints and SQL queries
│   ├── requirements.txt             Python dependencies
│   └── Dockerfile                   Docker image of the API
│
└── frontend/
    ├── index.html                   HTML template
    ├── package.json                 npm dependencies and scripts
    ├── rsbuild.config.ts            Rsbuild configuration (dev server on port 3006)
    ├── module-federation.config.ts  Module Federation remote `researcher_profile`
    ├── tsconfig.json                TypeScript configuration (references the two below)
    ├── tsconfig.app.json            TypeScript settings for the app code (src/)
    ├── tsconfig.node.json           TypeScript settings for the config files
    ├── .env.example                 Example environment file (API address, mock switch)
    ├── public/
    │   └── favicon.svg              Browser tab icon
    └── src/
        ├── index.tsx                Module Federation entry: loads main.tsx asynchronously
        ├── main.tsx                 Starts React and loads the Bootstrap CSS
        ├── App.tsx                  Root component exposed to the host: routes of the two pages
        ├── shared.ts                Contract props, data types, UI texts and helper functions
        ├── index.css                Small style adjustments on top of Bootstrap
        ├── api/researchers.ts       Fetches the data from the backend (or from the mock)
        ├── data/                    Mock rows, in-memory search and their tests
        └── components/
            ├── ResearcherSearchPage.tsx     Search bar, filters and results
            ├── ResearcherProfilePage.tsx    Profile page of one researcher
            ├── ResearcherProfileLayout.tsx  Wrapper around the routes
            ├── ResearcherResultList.tsx     List of search results
            ├── SearchBar.tsx                Search box with suggestions
            ├── FacetPanel.tsx               Filters by topic, skill, history and completed project
            ├── StatusMessage.tsx            Loading, error and empty states
            └── PageNotFound.tsx             Unknown route
```

## Run the database and the API

```bash
docker compose up --build
```

- API (`researcher-api`): http://localhost:8001 (container port 8000, so it can run next to `workforce-api` on 8000)
- Interactive docs (Swagger): http://localhost:8001/docs
- PostgreSQL (`workforce-db`): `localhost:5432` (user `admin`, password `password`, database `workforce_db`)

`database/init.sql`, the `workforce-db` service, the Dockerfile and `requirements.txt` are identical to the
workforce-service prototype, so the two projects share the same database.

`database/init.sql` only runs when the database volume is created. After changing
it, reset with `docker compose down -v && docker compose up --build`.

## Run the frontend against the API

```bash
cd frontend
cp .env.example .env     # PUBLIC_USE_MOCK=false, PUBLIC_API_URL=http://localhost:8001
npm install
npm run dev              # http://localhost:3006
```

With `PUBLIC_USE_MOCK` unset (or anything other than `false`) the frontend keeps
using the in-memory mock data, so it also runs without the backend.

The frontend is a Module Federation remote, so its code runs in the page of the
host app. The backend accepts requests from `http://localhost` on ports 3000-3006
(same range as `frontend/rsbuild.config.ts`). For other origins set `ALLOWED_ORIGINS`
(comma separated) on the backend.

## Run the backend without Docker (optional)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://admin:password@localhost:5432/workforce_db
uvicorn main:app --reload --port 8001
```

## API endpoints

JSON is camelCase and matches the types in `frontend/src/shared.ts`. UI texts stay in
the frontend (`shared.ts`); the API only returns data.

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/researchers/{id}` | Researcher profile (team, leader, colleagues, topics, contract, projects); 404 if missing |
| GET | `/api/researchers?query=&topics=&skills=&history=&completed=` | Search hits with the reasons they matched |
| GET | `/api/researchers/facets?...` | Facet values with result counts (same parameters as the search) |
| GET | `/api/researchers/suggestions?query=` | Search-bar suggestions |
| GET | `/api/researchers/summary` | Total researchers and how many have a completed project |

Search parameters: `topics`, `skills` and `history` are repeated
(`?topics=A&topics=B`). `completed` is `all` (default), `any`, or one or more
completed project ids (`?completed=3&completed=4`).
