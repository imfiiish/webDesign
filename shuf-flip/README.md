# shuf-flip · design

A design sample of the shuf-flip look, built with Vite + React + TypeScript.
Appearance only — no business logic, no data layer.

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # production build (tsc -b && vite build)
npm run lint     # oxlint
npm run preview  # preview the build
```

## Structure

```
src/
├── tokens.css      design tokens (single dark theme)
├── base.css        global baseline
├── catalog.ts      the entries shown in the sample (data)
├── components/     shared UI + hooks
└── pages/home/     "/" — Overview / Sidebar modes, Fonts specimen
```
