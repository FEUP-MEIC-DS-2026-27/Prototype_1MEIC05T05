# Researcher profile prototype (#73)

React + TypeScript + Rsbuild + Bootstrap.

## User story

See repo root [`README.md`](../README.md): **View Detailed Researcher Profile and Expertise** — GitHub `#73`.

## Mock database (POs)

[`reference/mock_example.sql`](./reference/mock_example.sql) — see [`reference/README.md`](./reference/README.md).

## Commands

```bash
npm install
npm run dev
npm run build
```

## UI components

UI components live under `src/components/` and use Bootstrap. They do not live under `components/ui/`. Add one by creating a file in `src/components/`.

Below the `lg` breakpoint, facet filters open in a Bootstrap offcanvas from a Filters button. From `lg` upward, the same topic, skill, history, and completed-project controls stay visible in a sidebar beside the results.
