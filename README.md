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
npm test
npm run build
```

The site is deployed on Vercel from `main` (Vite preset: build `npm run build`, output `dist`). CI runs lint, tests, and build.

## Notes

- Uses local in-memory state only (no accounts, analytics, local storage, or cookies).
- Includes an 8-question wizard and a personalized slide-style action plan.
- Resource data (verification labels and dates) is centralized in `/src/resourceData.ts`.
- Visual walkthrough metadata is attached per resource and rendered with the reusable `VisualWalkthrough` component.
- Real screenshot capture/annotation generation requires external browsing + AI services plus human verification before publishing guides.
- Contact info marked `Needs review` must be manually verified before public launch.
- Screenshot capture scripts live in `/scripts`; `scripts/annotate-washington-connection-walkthrough.py` (Python, Pillow) adds the annotations. Capture scripts use a temporary browser profile that is deleted on exit.
- Walkthrough screenshots that are not human-reviewed are labeled `needs review` in the UI.
