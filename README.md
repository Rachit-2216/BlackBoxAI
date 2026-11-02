# BlackBoxAI

BlackBoxAI is a cybersecurity and machine-learning portfolio demo for firmware cryptography analysis.

- `standard_model/` detects known primitives such as AES, RSA, SHA, HMAC, and ECC.
- `proprietary_model/` classifies custom or non-standard cryptographic patterns.
- `api_server.py` exposes both pipelines through a Flask/PyTorch API.
- `frontend/` is a standalone React/Vite landing page with an interactive Three.js firmware core, scroll-linked analysis diagrams, and an illustrative evidence lab. It needs no backend or environment variables.

## Repository Layout

```text
.
|- api_server.py
|- Dockerfile
|- render.yaml
|- datasets/
|- docs/
|- frontend/
|- proprietary_model/
`- standard_model/
```

## What Is Implemented

- CSV inference remains available as downloadable reports.
- JSON inference is available at `POST /api/standard/inference?format=json` and `POST /api/proprietary/inference?format=json`.
- Firmware-like binary upload is available at `POST /api/standard/analyze-binary` and `POST /api/proprietary/analyze-binary`.
- `GET /api/model-info` exposes labels, thresholds, extension allowlists, and upload limits.
- Uploads are validated by extension and size, processed without persisted upload files, and served with explicit CORS/security headers.
- The public frontend uses three clearly marked illustrative samples. It supports sample switching, evidence tabs, scan replay, and JSON demo-report export without uploading files or invoking model inference.

## Frontend-Only Preview

```powershell
cd frontend
npm ci
npm run dev
```

The landing page works independently of Python, model weights, and API configuration. The earlier tool-page source remains in the repository but is not mounted by the current landing-page entry point.

## Quick Start

### 1. Install Python dependencies

```powershell
pip install -r requirements_api.txt
```

### 2. Start the backend

```powershell
python api_server.py
```

The API defaults to `http://localhost:5000`.

### 3. Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

No environment file is required for the landing page.

## Deployment

The public site runs entirely on Vercel:

- Vercel project root: repository root (`.`). The root `vercel.json` installs and builds `frontend/`, then serves `frontend/dist` with SPA fallback and security headers.
- Alternatively, a Vercel project rooted in `frontend/` can use its local configuration with `npm run build` and output directory `dist`.
- The Python API can be run separately on Render using the Docker service and `/api/health`. It is optional for the public landing page.

For development of the legacy API-connected tool screens only:

```dotenv
VITE_API_URL=https://your-render-api.onrender.com
```

Set `MODEL_API_CORS_ORIGINS` on Render to the deployed Vercel origin.

## Documentation

- API usage and deployment notes: [docs/api.md](docs/api.md)
- Local sample inference: [docs/local-inference.md](docs/local-inference.md)
- Frontend notes: [frontend/README.md](frontend/README.md)
- Standard model notes: [standard_model/README.md](standard_model/README.md)
- Proprietary model notes: [proprietary_model/README.md](proprietary_model/README.md)
