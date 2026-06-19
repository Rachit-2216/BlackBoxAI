# BlackBoxAI API

The API is a Flask service for standard and proprietary firmware cryptography inference. It supports CSV report downloads, JSON inference responses, and small binary firmware uploads.

## Quick Start

```powershell
pip install -r requirements_api.txt
python api_server.py
```

Default address: `http://localhost:5000`

## Configuration

```dotenv
MODEL_API_HOST=0.0.0.0
MODEL_API_PORT=5000
MODEL_API_MAX_UPLOAD_MB=25
MODEL_API_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

For Render, deploy the repository root with the included `Dockerfile` or `render.yaml`. The container runs:

```text
gunicorn api_server:app --bind 0.0.0.0:5000 --workers 1 --timeout 180
```

## Common JSON Response

JSON inference and binary analysis endpoints return:

```json
{
  "runId": "16-byte-hex-id",
  "modelType": "standard",
  "input": {
    "filename": "firmware.bin",
    "size": 1024,
    "sha256": "hex",
    "kind": "binary"
  },
  "summary": {
    "detectedLabels": ["aes", "sha256"],
    "topPrediction": "aes",
    "riskScore": 42,
    "riskLevel": "medium"
  },
  "details": {},
  "rows": []
}
```

`rows` is present only for CSV JSON mode.

## Endpoints

### `GET /api/health`

Returns service health and model load state.

```json
{
  "status": "ok",
  "proprietary_loaded": true,
  "standard_loaded": true
}
```

### `GET /api/model-info`

Returns labels, model thresholds, allowed extensions, and upload size.

### `POST /api/standard/inference`

- Input: multipart form upload with `file` containing a CSV file.
- Default output: downloadable CSV.
- JSON output: add `?format=json`.

### `POST /api/proprietary/inference`

- Input: multipart form upload with `file` containing a CSV file.
- Default output: downloadable CSV.
- JSON output: add `?format=json`.

### `POST /api/standard/analyze-binary`

- Input: multipart form upload with `file`.
- Allowed extensions: `.bin`, `.elf`, `.hex`, `.fw`, `.img`, `.rom`.
- Output: common JSON response.

### `POST /api/proprietary/analyze-binary`

- Input: multipart form upload with `file`.
- Allowed extensions: `.bin`, `.elf`, `.hex`, `.fw`, `.img`, `.rom`.
- Output: common JSON response with proprietary features and recommendations.

## Examples

```powershell
curl.exe -X POST "http://localhost:5000/api/standard/inference?format=json" `
  -F "file=@datasets/Standard/standard_test_dataset.csv"
```

```powershell
curl.exe -X POST "http://localhost:5000/api/proprietary/analyze-binary" `
  -F "file=@firmware-sample.bin"
```

## Frontend Integration

The frontend API helper lives in `frontend/src/lib/api.ts` and exposes:

- `checkHealth()`
- `getModelInfo()`
- `analyzeStandardCsv(file, "csv" | "json")`
- `analyzeProprietaryCsv(file, "csv" | "json")`
- `analyzeStandardBinary(file)`
- `analyzeProprietaryBinary(file)`

For Vercel, set:

```dotenv
VITE_API_URL=https://your-render-api.onrender.com
VITE_HEYGEN_PROMO_URL=
```

## Security Notes

- No authentication, accounts, database, or job queue are included in v1.
- Uploads are size-limited by `MODEL_API_MAX_UPLOAD_MB`.
- Uploaded files are read in memory and not persisted by the API.
- CORS defaults to local Vite origins and should be set explicitly for hosted deployments.
- Security headers are added by Flask and Vercel config.
