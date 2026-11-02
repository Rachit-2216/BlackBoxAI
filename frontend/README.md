# BlackBoxAI Frontend

Standalone React/Vite landing page for BlackBoxAI. No Python process, model server, uploads, or environment variables are needed.

## Commands

```powershell
npm install
npm run dev
npm run lint
npm run build
npm run test:ui-contract
```

Browser checks expect the local preview at `http://127.0.0.1:5186`; start it with `npm run dev -- --port 5186`. Set `LANDING_URL` to test another local or deployed URL. On Windows the checks use installed Chrome; elsewhere run `npx playwright install chromium` first. Screenshots are written to the ignored `qa-screenshots/` directory.

## Experience

- A lazy-loaded Three.js silver core that opens on scroll. The hero holds for 420 pixels of native scrolling: the core opens in the first 320 pixels, stays open briefly, then the page continues. Scrolling back reassembles it. Reduced motion skips the pin and shows a stable partially open core.
- A scroll-linked analysis sequence with three manually selectable stages.
- A browser-only evidence lab with three illustrative samples, keyboard-accessible tabs, scan replay, and JSON demo-report export.
- Responsive navigation, expandable field notes, reduced-motion support, and a static WebGL fallback.

## Editing

- `src/pages/Landing.tsx`: page structure, content, navigation, pipeline, and field notes.
- `src/landing.css`: responsive layouts, typography, color tokens, and CSS motion.
- `src/components/landing/FirmwareCore.tsx`: procedural 3D geometry, lighting, pointer and scroll response.
- `src/components/landing/EvidenceLab.tsx`: sample data and interactive evidence views.
- `src/components/landing/MotionType.tsx`: layout-stable decoding text and scroll-linked word reveals.
- `src/components/landing/SignalPassage.tsx`: pinned binary/pattern/evidence choreography with moving data slabs.

All sample results are illustrative and explicitly marked. The older API-connected tool components remain available in source but are not mounted in `App.tsx`.

## Vercel

- Existing project root: repository root (`.`).
- Install command: `npm ci --prefix frontend`.
- Build command: `npm run build --prefix frontend`.
- Output directory: `frontend/dist`.
- Required environment variables: none.

The root `vercel.json` provides these build settings, SPA fallback, and security headers. A project rooted directly in `frontend/` can use the configuration in that directory instead.
