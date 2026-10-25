# Washington Support Steps Prototype

A React + TypeScript prototype for a Diamond Challenge concept that helps domestic violence survivors navigate housing, school continuity, and benefits resources.

## Run locally

```bash
npm install
npm run dev
```

## Build and lint

```bash
npm run lint
npm run build
```

## Notes

- Uses local in-memory state only (no accounts, analytics, local storage, or cookies).
- Includes an 8-question wizard and a personalized slide-style action plan.
- Resource data (verification labels and dates) is centralized in `/src/resourceData.ts`.
- Contact info marked `Needs review` must be manually verified before public launch.
