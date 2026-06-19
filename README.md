# BlackBoxAI

BlackBoxAI is a cybersecurity and machine-learning portfolio demo for firmware cryptography analysis.

- `standard_model/` detects known primitives such as AES, RSA, SHA, HMAC, and ECC.
- `proprietary_model/` classifies custom or non-standard cryptographic patterns.
- `api_server.py` exposes both pipelines through a Flask/PyTorch API.
- `frontend/` provides a React/Vite command-center UI with Motion animations, real upload flows, and local browser run memory.

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
- The frontend stores recent JSON analysis runs in `localStorage`; bundled sample data is used only as an offline fallback.

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

Create `frontend/.env` from `frontend/.env.example` to point the UI at a different backend URL.

## Deployment

The intended hosted split is:

- Render: Docker service from the repository root, health check `/api/health`.
- Vercel: frontend project root `frontend`, build command `npm run build`, output directory `dist`.

After the Render API is live, set this Vercel environment variable:

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
