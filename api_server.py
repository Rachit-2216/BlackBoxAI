"""
Local Flask API for BlackBoxAI model inference.
"""
from __future__ import annotations

import os
import hashlib
import io
import secrets
from typing import Any, Literal

import numpy as np
import pandas as pd
from flask import Flask, Response, jsonify, request, send_file
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.utils import secure_filename

from proprietary_model.config import OPERATION_LABELS, PROPRIETARY_ALGORITHMS
from proprietary_model.inference import ProprietaryInference
from standard_model.config import CRYPTO_LABELS
from standard_model.inference import CryptoDetector

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
HOST = os.getenv("MODEL_API_HOST", "0.0.0.0")
PORT = int(os.getenv("MODEL_API_PORT", os.getenv("PORT", "5000")))
DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = os.getenv("MODEL_API_CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
MAX_UPLOAD_MB = int(os.getenv("MODEL_API_MAX_UPLOAD_MB", "25"))
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

CSV_EXTENSIONS = {".csv"}
BINARY_EXTENSIONS = {".bin", ".elf", ".hex", ".fw", ".img", ".rom"}
WEAK_STANDARD_LABELS = {"md5", "sha1", "des", "dsa"}

app = Flask(__name__)
app.config.update(
    MAX_CONTENT_LENGTH=MAX_UPLOAD_BYTES,
    MAX_FORM_MEMORY_SIZE=min(MAX_UPLOAD_BYTES, 2 * 1024 * 1024),
    MAX_FORM_PARTS=4,
)

allowed_origins = [origin.strip() for origin in CORS_ORIGINS.split(",") if origin.strip()]
if "*" in allowed_origins:
    CORS(app, resources={r"/api/*": {"origins": "*"}})
else:
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": allowed_origins,
                "methods": ["GET", "POST", "OPTIONS"],
                "allow_headers": ["Content-Type"],
            }
        },
    )

proprietary_engine: ProprietaryInference | None = None
standard_engine: CryptoDetector | None = None


def _stable_seed(value: Any) -> int:
    digest = hashlib.sha256(str(value).encode("utf-8")).digest()
    return int.from_bytes(digest[:4], "big")


def _extract_file_id(row: pd.Series, default_idx: int) -> Any:
    for column in ["fileId", "file_id", "id", "ID"]:
        if column in row.index and pd.notna(row[column]):
            return row[column]
    return default_idx


def _file_extension(filename: str) -> str:
    return os.path.splitext(filename.lower())[1]


def _validate_upload(filename: str, allowed_extensions: set[str]) -> str:
    safe_name = secure_filename(filename or "")
    if not safe_name:
        raise ValueError("No file selected")

    extension = _file_extension(safe_name)
    if extension not in allowed_extensions:
        expected = ", ".join(sorted(allowed_extensions))
        raise ValueError(f"Unsupported file type. Expected one of: {expected}")

    return safe_name


def _read_uploaded_file(allowed_extensions: set[str]) -> tuple[str, bytes]:
    if "file" not in request.files:
        raise ValueError("No file provided")

    uploaded_file = request.files["file"]
    filename = _validate_upload(uploaded_file.filename or "", allowed_extensions)
    data = uploaded_file.read()
    if not data:
        raise ValueError("Uploaded file is empty")

    return filename, data


def _json_error(message: str, status_code: int):
    return jsonify({"error": message}), status_code


def _json_safe(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items()}

    if isinstance(value, (list, tuple, set)):
        return [_json_safe(item) for item in value]

    if isinstance(value, np.ndarray):
        return _json_safe(value.tolist())

    if isinstance(value, np.generic):
        return _json_safe(value.item())

    if isinstance(value, float):
        return value if np.isfinite(value) else None

    if value is pd.NA:
        return None

    return value


@app.after_request
def add_security_headers(response: Response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    response.headers.setdefault("Cache-Control", "no-store")
    return response


@app.errorhandler(RequestEntityTooLarge)
def handle_too_large(_exc: RequestEntityTooLarge):
    return _json_error(f"Uploaded file is too large. Maximum size is {MAX_UPLOAD_MB} MB.", 413)


def init_proprietary_engine() -> ProprietaryInference:
    global proprietary_engine
    if proprietary_engine is None:
        checkpoint_path = os.path.join(
            PROJECT_ROOT,
            "proprietary_model",
            "checkpoints",
            "proprietary_model.pt",
        )
        print("Loading proprietary model...")
        proprietary_engine = ProprietaryInference(checkpoint_path=checkpoint_path)
        print("Proprietary model ready.")
    return proprietary_engine


def init_standard_engine() -> CryptoDetector:
    global standard_engine
    if standard_engine is None:
        checkpoint_path = os.path.join(
            PROJECT_ROOT,
            "standard_model",
            "checkpoints",
            "standard_model.pt",
        )
        print("Loading standard model...")
        standard_engine = CryptoDetector(checkpoint_path=checkpoint_path)
        print("Standard model ready.")
    return standard_engine


def generate_binary_from_row(row: pd.Series, default_idx: int = 0) -> bytes:
    code_size = 1000
    for column in ["codeSize", "code_size", "size", "fileSize"]:
        if column in row.index and pd.notna(row[column]):
            try:
                code_size = max(100, int(float(row[column])))
                break
            except (TypeError, ValueError):
                continue

    sample_id = _extract_file_id(row, default_idx)
    rng = np.random.default_rng(_stable_seed(sample_id))
    return rng.integers(0, 256, size=code_size, dtype=np.uint8).tobytes()


def _results_to_csv_download(results: list[dict[str, Any]], filename: str):
    results_df = pd.DataFrame(results)
    output = io.StringIO()
    results_df.to_csv(output, index=False)
    output.seek(0)

    return send_file(
        io.BytesIO(output.getvalue().encode("utf-8")),
        mimetype="text/csv",
        as_attachment=True,
        download_name=filename,
    )


def _input_metadata(filename: str, data: bytes, kind: Literal["csv", "binary"]) -> dict[str, Any]:
    return {
        "filename": filename,
        "size": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "kind": kind,
    }


def _risk_level(score: int) -> str:
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def _standard_summary(result: dict[str, Any]) -> dict[str, Any]:
    probabilities = result.get("probabilities", {})
    detections = result.get("detections", {})
    sorted_probabilities = sorted(probabilities.items(), key=lambda item: item[1], reverse=True)
    detected_labels = [
        label
        for label, detection in detections.items()
        if isinstance(detection, dict) and detection.get("present")
    ]
    top_prediction = sorted_probabilities[0][0] if sorted_probabilities else "none"
    max_confidence = float(sorted_probabilities[0][1]) if sorted_probabilities else 0.0
    weak_hits = len([label for label in detected_labels if label in WEAK_STANDARD_LABELS])
    entropy_high = bool(result.get("signature_features", {}).get("ENTROPY_HIGH"))
    risk_score = min(100, int((max_confidence * 70) + (weak_hits * 20) + (10 if entropy_high else 0)))

    return {
        "detectedLabels": detected_labels,
        "topPrediction": top_prediction,
        "riskScore": risk_score,
        "riskLevel": _risk_level(risk_score),
    }


def _proprietary_summary(result: dict[str, Any]) -> dict[str, Any]:
    algorithm = result.get("algorithm_name") or result.get("operation") or "unknown"
    confidence = float(result.get("confidence", 0.0) or 0.0)
    proprietary_flag = int(result.get("proprietary", 0) or 0)
    structural_flags = sum(
        int(bool(result.get(key, 0)))
        for key in ["has_sbox", "has_permutation", "has_rounds", "key_schedule", "bitwise_heavy", "arithmetic_heavy"]
    )
    risk_score = min(100, int((confidence * 65) + (proprietary_flag * 15) + (structural_flags * 4)))

    return {
        "detectedLabels": [algorithm] if algorithm != "unknown" else [],
        "topPrediction": algorithm,
        "riskScore": risk_score,
        "riskLevel": _risk_level(risk_score),
    }


def _standard_csv_row(file_id: Any, result: dict[str, Any]) -> dict[str, Any]:
    formatted_result: dict[str, Any] = {"fileId": file_id}
    detected_algorithms = []
    for label, detection in result["detections"].items():
        formatted_result[f"{label}_confidence"] = detection["confidence"]
        if detection["present"]:
            detected_algorithms.append(label)

    sorted_probabilities = sorted(
        result["probabilities"].items(),
        key=lambda item: item[1],
        reverse=True,
    )
    formatted_result["top_predictions"] = ",".join(
        label for label, probability in sorted_probabilities[:3] if probability > 0.1
    ) or "none"
    formatted_result["detected_algorithms"] = ",".join(detected_algorithms) or "none"

    for key, value in result["signature_features"].items():
        formatted_result[key.lower()] = int(bool(value))

    return formatted_result


def _common_response(
    *,
    model_type: Literal["standard", "proprietary"],
    filename: str,
    data: bytes,
    kind: Literal["csv", "binary"],
    summary: dict[str, Any],
    details: dict[str, Any],
    rows: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    payload = {
        "runId": secrets.token_hex(8),
        "modelType": model_type,
        "input": _input_metadata(filename, data, kind),
        "summary": summary,
        "details": details,
    }
    if rows is not None:
        payload["rows"] = rows
    return _json_safe(payload)


@app.route("/api/health", methods=["GET"])
def health():
    return {
        "status": "ok",
        "proprietary_loaded": proprietary_engine is not None,
        "standard_loaded": standard_engine is not None,
    }


@app.route("/api/model-info", methods=["GET"])
def model_info():
    return {
        "models": {
            "standard": {
                "labels": CRYPTO_LABELS,
                "threshold": 0.35,
                "description": "Known cryptographic primitive detection",
            },
            "proprietary": {
                "labels": OPERATION_LABELS,
                "algorithmFamilies": PROPRIETARY_ALGORITHMS,
                "threshold": 0.5,
                "description": "Custom or non-standard cryptographic pattern detection",
            },
        },
        "upload": {
            "maxUploadMb": MAX_UPLOAD_MB,
            "csvExtensions": sorted(CSV_EXTENSIONS),
            "binaryExtensions": sorted(BINARY_EXTENSIONS),
        },
    }


@app.route("/api/proprietary/inference", methods=["POST"])
def proprietary_inference():
    try:
        filename, csv_bytes = _read_uploaded_file(CSV_EXTENSIONS)
        df = pd.read_csv(io.BytesIO(csv_bytes))
        engine = init_proprietary_engine()
        print(f"Processing {len(df)} samples with proprietary model...")

        results: list[dict[str, Any]] = []
        first_result: dict[str, Any] | None = None
        for idx, row in df.iterrows():
            try:
                binary = generate_binary_from_row(row, idx)
                result = engine.analyze_binary(binary)
                result["fileId"] = _extract_file_id(row, idx)
                if first_result is None:
                    first_result = dict(result)
                results.append(result)
            except Exception as exc:  # pragma: no cover - best-effort batch execution
                print(f"Skipping proprietary row {idx}: {str(exc)[:120]}")

        if request.args.get("format") == "json":
            summary = _proprietary_summary(first_result or {})
            return jsonify(
                _common_response(
                    model_type="proprietary",
                    filename=filename,
                    data=csv_bytes,
                    kind="csv",
                    summary=summary,
                    rows=results,
                    details=first_result or {},
                )
            )

        return _results_to_csv_download(results, "proprietary_results.csv")
    except ValueError as exc:
        return _json_error(str(exc), 400)
    except RequestEntityTooLarge:
        raise
    except Exception as exc:
        return _json_error(str(exc), 500)


@app.route("/api/standard/inference", methods=["POST"])
def standard_inference():
    try:
        filename, csv_bytes = _read_uploaded_file(CSV_EXTENSIONS)
        df = pd.read_csv(io.BytesIO(csv_bytes))
        engine = init_standard_engine()
        print(f"Processing {len(df)} samples with standard model...")

        results: list[dict[str, Any]] = []
        first_raw_result: dict[str, Any] | None = None
        for idx, row in df.iterrows():
            try:
                binary = generate_binary_from_row(row, idx)
                result = engine.detect(binary_data=binary)
                if first_raw_result is None:
                    first_raw_result = result
                results.append(_standard_csv_row(_extract_file_id(row, idx), result))
            except Exception as exc:  # pragma: no cover - best-effort batch execution
                print(f"Skipping standard row {idx}: {str(exc)[:120]}")

        if request.args.get("format") == "json":
            details = first_raw_result or {}
            return jsonify(
                _common_response(
                    model_type="standard",
                    filename=filename,
                    data=csv_bytes,
                    kind="csv",
                    summary=_standard_summary(details),
                    rows=results,
                    details=details,
                )
            )

        return _results_to_csv_download(results, "standard_results.csv")
    except ValueError as exc:
        return _json_error(str(exc), 400)
    except RequestEntityTooLarge:
        raise
    except Exception as exc:
        return _json_error(str(exc), 500)


@app.route("/api/standard/analyze-binary", methods=["POST"])
def standard_binary_analysis():
    try:
        filename, binary = _read_uploaded_file(BINARY_EXTENSIONS)
        result = init_standard_engine().detect(binary_data=binary)
        return jsonify(
            _common_response(
                model_type="standard",
                filename=filename,
                data=binary,
                kind="binary",
                summary=_standard_summary(result),
                details=result,
            )
        )
    except ValueError as exc:
        return _json_error(str(exc), 400)
    except RequestEntityTooLarge:
        raise
    except Exception as exc:
        return _json_error(str(exc), 500)


@app.route("/api/proprietary/analyze-binary", methods=["POST"])
def proprietary_binary_analysis():
    try:
        filename, binary = _read_uploaded_file(BINARY_EXTENSIONS)
        result = init_proprietary_engine().analyze_binary(binary)
        return jsonify(
            _common_response(
                model_type="proprietary",
                filename=filename,
                data=binary,
                kind="binary",
                summary=_proprietary_summary(result),
                details=result,
            )
        )
    except ValueError as exc:
        return _json_error(str(exc), 400)
    except RequestEntityTooLarge:
        raise
    except Exception as exc:
        return _json_error(str(exc), 500)


if __name__ == "__main__":
    print("=" * 70)
    print("BlackBoxAI Model API Server")
    print("=" * 70)
    print()
    print("Endpoints:")
    print("  GET  /api/health")
    print("  GET  /api/model-info")
    print("  POST /api/standard/inference")
    print("  POST /api/proprietary/inference")
    print("  POST /api/standard/analyze-binary")
    print("  POST /api/proprietary/analyze-binary")
    print()
    print(f"Starting server on http://localhost:{PORT}")
    print()

    app.run(host=HOST, port=PORT, debug=False)
