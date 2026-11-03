# Researcher profile prototype (#73)

React 18.3.1 + TypeScript + Rsbuild Module Federation remote + Bootstrap 5.3.8.

Standalone `npm run dev` serves http://localhost:3006.

## User story

See repo root [`README.md`](../README.md): **View Detailed Researcher Profile and Expertise** — GitHub `#73`.

## Layout

The file layout follows the other prototypes of the repository (`main.tsx`, `App.tsx`, `shared.ts`, `index.css`,
`components/`). The differences are the Module Federation remote (Rsbuild instead of Vite) and the `api/` and
`data/` folders.

```
frontend/
├── index.html                      HTML template (Rsbuild adds the script and the favicon)
├── package.json                    npm dependencies and scripts
├── rsbuild.config.ts               Rsbuild configuration (dev server on port 3006)
├── module-federation.config.ts     Module Federation remote `researcher_profile`
├── tsconfig.json                   TypeScript configuration (references the two below)
├── tsconfig.app.json               TypeScript settings for the app code (src/)
├── tsconfig.node.json              TypeScript settings for the config files
├── vitest.config.ts                Test runner configuration
├── .env.example                    Example environment file (API address, mock switch)
├── public/
│   └── favicon.svg                 Browser tab icon
└── src/
    ├── index.tsx                   Module Federation entry: loads main.tsx asynchronously
    ├── main.tsx                    Starts React (standalone mode) and loads the Bootstrap CSS
    ├── App.tsx                     Root component exposed to the host: routes of the two pages
    ├── shared.ts                   Contract props, data types, UI texts and helper functions
    ├── index.css                   Small style adjustments on top of Bootstrap
    ├── css.d.ts, env.d.ts          Type declarations (CSS imports, PUBLIC_* variables)
    ├── api/
    │   └── researchers.ts          Fetches the data from the backend (or from the mock)
    ├── data/
    │   ├── mock.ts                 Small mock data set (not the database seed)
    │   ├── profile.ts              In-memory search over the mock rows
    │   └── profile.test.ts         Tests of the mock logic and of the helpers in shared.ts
    └── components/
        ├── ResearcherSearchPage.tsx     Search page: search bar, filters and results
        ├── ResearcherProfilePage.tsx    Profile page of one researcher
        ├── ResearcherProfileLayout.tsx  Wrapper around the routes
        ├── ResearcherResultList.tsx     List of search results
        ├── SearchBar.tsx                Search box with suggestions
        ├── FacetPanel.tsx               Filters by topic, skill, history and completed project
        ├── StatusMessage.tsx            Loading, error and empty states
        └── PageNotFound.tsx             Unknown route
```

Components only depend on `shared.ts` and `api/researchers.ts`. Only `api/researchers.ts` imports `data/`, and only
when the mock is on.

## Federation contract

Remote name `researcher_profile`. Exposed module `./ResearcherProfile` from `./src/App.tsx`.

The default export is a component with props `{ basePath: string }`. `contractVersion` is `1`.

Shared singletons: react 18.3.1, react-dom 18.3.1, react-router-dom 7.9.6.

`npm run build` writes `dist/mf-manifest.json` and `remoteEntry.js`.

## Backend and mock data

Copy `.env.example` to `.env`:

| Variable | Meaning |
|---|---|
| `PUBLIC_USE_MOCK` | `false` = use the FastAPI backend. Unset or anything else = in-memory mock data. |
| `PUBLIC_API_URL` | Backend address, default `http://localhost:8001`. Endpoints are under `/api`. |

See the repo root [`README.md`](../README.md) for the endpoints. `src/api/researchers.ts` is the only file that makes
HTTP calls. Restart `npm run dev` after changing `.env`.

## Commands

```bash
npm install
npm run dev        # http://localhost:3006
npm run build      # type-check, then dist/ with mf-manifest.json and remoteEntry.js
npm run lint       # oxlint
npm test           # vitest: mock logic and helpers
```

## UI components

UI components live under `src/components/` and use Bootstrap. Add one by creating a file in `src/components/`
with a default export.

Below the `lg` breakpoint, facet filters open in a Bootstrap offcanvas from a Filters button. From `lg` upward, the same
topic, skill, history, and completed-project controls stay visible in a sidebar beside the results.

## Migration

The previous stack was Vite, Tailwind, and shadcn. It was replaced by Rsbuild, Module Federation, Bootstrap, and
React 18.3.1.
