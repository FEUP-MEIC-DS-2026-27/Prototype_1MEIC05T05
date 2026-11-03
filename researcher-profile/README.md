# Researcher profile prototype (#73)

React 18.3.1 + TypeScript + Rsbuild Module Federation remote + Bootstrap 5.3.8.

Standalone `npm run dev` serves http://localhost:3006.

## User story

See repo root [`README.md`](../README.md): **View Detailed Researcher Profile and Expertise** — GitHub `#73`.

## Federation contract

Remote name `researcher_profile`. Exposed module `./ResearcherProfile` from `./src/ResearcherProfile.tsx`.

The default export is a component with props `{ basePath: string }`. `contractVersion` is `1`.

Shared singletons: react 18.3.1, react-dom 18.3.1, react-router-dom 7.9.6.

`npm run build` writes `dist/mf-manifest.json` and `remoteEntry.js`.

## Mock data

Mock data is the default. `PUBLIC_USE_MOCK=false` turns the facade off. `PUBLIC_API_BASE` is reserved and unused.

## Mock database (POs)

[`reference/mock_example.sql`](./reference/mock_example.sql) — see [`reference/README.md`](./reference/README.md).

## Commands

```bash
npm install
npm run dev
npm run build
npm test
```

`npm run dev` serves the standalone app at http://localhost:3006. `npm run build` writes `dist/mf-manifest.json` and `remoteEntry.js`. `npm test` runs the domain suite.

## UI components

UI components live under `src/components/` and use Bootstrap. Add one by creating a file in `src/components/`.

Below the `lg` breakpoint, facet filters open in a Bootstrap offcanvas from a Filters button. From `lg` upward, the same topic, skill, history, and completed-project controls stay visible in a sidebar beside the results.

## Migration

The previous stack was Vite, Tailwind, and shadcn. It was replaced by Rsbuild, Module Federation, Bootstrap, and React 18.3.1.
