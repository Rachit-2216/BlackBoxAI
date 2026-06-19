# BlackBoxAI Frontend

React/Vite command-center UI for the BlackBoxAI model API.

## Commands

```powershell
npm install
npm run dev
npm run lint
npm run build
```

## Environment

Create `frontend/.env` from `frontend/.env.example`:

```dotenv
VITE_API_URL=http://localhost:5000
VITE_HEYGEN_PROMO_URL=
```

`VITE_API_URL` points to the Flask API. In production, set it to the Render API domain.

`VITE_HEYGEN_PROMO_URL` is optional. When set to an MP4 URL, the dashboard displays that video in the promo slot.

## Vercel

- Project root: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Required env: `VITE_API_URL=https://your-render-api.onrender.com`

The included `vercel.json` provides SPA refresh fallback and security headers.
