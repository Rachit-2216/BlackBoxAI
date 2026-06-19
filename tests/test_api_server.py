import io
import json
import unittest
from unittest.mock import patch

import numpy as np

import api_server


class FakeStandardEngine:
    crypto_labels = ["aes", "sha256", "md5"]
    threshold = 0.35

    def detect(self, binary_data=None, filepath=None):
        return {
            "probabilities": {"aes": 0.92, "sha256": 0.73, "md5": 0.08},
            "detections": {
                "aes": {"present": True, "confidence": 0.92},
                "sha256": {"present": True, "confidence": 0.73},
                "md5": {"present": False, "confidence": 0.08},
            },
            "entropy_regions": [(16, 128)],
            "metadata": {
                "file_size": len(binary_data or b""),
                "arch_type": "ARM",
                "num_sections": 1,
                "is_ELF": False,
                "is_BIN": True,
            },
            "signature_features": {
                "AES_SBOX_FOUND": True,
                "SHA256_CONST_FOUND": True,
                "MD5_CONST_FOUND": False,
                "ECC_PARAM_FOUND": False,
                "RSA_ASN1_FOUND": False,
                "ENTROPY_HIGH": True,
            },
        }


class FakeProprietaryEngine:
    operation_labels = ["CustomXOR", "RotaryHash", "KeyScheduler"]

    def analyze_binary(self, binary_data, threshold=0.5):
        return {
            "algorithm_name": "CustomXOR",
            "operation": "CustomXOR",
            "confidence": 0.84,
            "has_sbox": 0,
            "has_permutation": 0,
            "has_rounds": 1,
            "key_schedule": 0,
            "bitwise_heavy": 1,
            "arithmetic_heavy": 0,
            "proprietary": 1,
            "recommendations": ["Review proprietary cipher manually"],
        }


class ApiServerTest(unittest.TestCase):
    def setUp(self):
        self.client = api_server.app.test_client()
        self.standard_patch = patch.object(
            api_server,
            "init_standard_engine",
            return_value=FakeStandardEngine(),
        )
        self.proprietary_patch = patch.object(
            api_server,
            "init_proprietary_engine",
            return_value=FakeProprietaryEngine(),
        )
        self.standard_patch.start()
        self.proprietary_patch.start()

    def tearDown(self):
        self.standard_patch.stop()
        self.proprietary_patch.stop()

    def post_file(self, path, filename, data, content_type="text/csv"):
        return self.client.post(
            path,
            data={"file": (io.BytesIO(data), filename, content_type)},
            content_type="multipart/form-data",
        )

    def test_health_reports_api_status(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "ok")

    def test_model_info_exposes_supported_models_and_upload_policy(self):
        response = self.client.get("/api/model-info")

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertIn("aes", payload["models"]["standard"]["labels"])
        self.assertIn("sha256", payload["models"]["standard"]["labels"])
        self.assertIn(".csv", payload["upload"]["csvExtensions"])
        self.assertIn(".bin", payload["upload"]["binaryExtensions"])
        self.assertGreater(payload["upload"]["maxUploadMb"], 0)

    def test_standard_csv_inference_json_mode_returns_run_shape(self):
        csv_data = b"fileId,codeSize,architecture\nfw-1,512,ARM\n"
        response = self.post_file("/api/standard/inference?format=json", "input.csv", csv_data)

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertRegex(payload["runId"], r"^[0-9a-f]{16}$")
        self.assertEqual(payload["modelType"], "standard")
        self.assertEqual(payload["input"]["kind"], "csv")
        self.assertEqual(payload["summary"]["topPrediction"], "aes")
        self.assertEqual(payload["summary"]["detectedLabels"], ["aes", "sha256"])
        self.assertEqual(len(payload["rows"]), 1)
        self.assertIn("probabilities", payload["details"])

    def test_common_json_response_normalizes_numpy_scalars(self):
        with api_server.app.app_context():
            response = api_server.jsonify(
                api_server._common_response(
                    model_type="standard",
                    filename="input.csv",
                    data=b"fileId\nfw-1\n",
                    kind="csv",
                    summary={
                        "detectedLabels": ["aes"],
                        "topPrediction": "aes",
                        "riskScore": np.int64(64),
                        "riskLevel": "medium",
                    },
                    details={
                        "probabilities": {"aes": np.float32(0.91)},
                        "detections": {"aes": {"present": np.bool_(True)}},
                    },
                    rows=[{"fileId": "fw-1", "aes_detected": np.bool_(True)}],
                )
            )

        payload = json.loads(response.get_data(as_text=True))
        self.assertIs(payload["details"]["detections"]["aes"]["present"], True)
        self.assertEqual(payload["summary"]["riskScore"], 64)
        self.assertIs(payload["rows"][0]["aes_detected"], True)

    def test_proprietary_csv_download_mode_still_returns_csv_attachment(self):
        csv_data = b"fileId,codeSize,architecture\nfw-2,512,ARM\n"
        response = self.post_file("/api/proprietary/inference", "input.csv", csv_data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, "text/csv")
        self.assertIn("attachment", response.headers["Content-Disposition"])
        self.assertIn("algorithm_name", response.get_data(as_text=True))

    def test_standard_binary_upload_returns_json_analysis(self):
        response = self.post_file(
            "/api/standard/analyze-binary",
            "firmware.bin",
            b"\x00\x01\x02\x03" * 80,
            "application/octet-stream",
        )

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["modelType"], "standard")
        self.assertEqual(payload["input"]["kind"], "binary")
        self.assertEqual(payload["input"]["filename"], "firmware.bin")
        self.assertEqual(payload["summary"]["riskLevel"], "high")

    def test_upload_without_file_is_rejected(self):
        response = self.client.post("/api/standard/analyze-binary", data={})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error"], "No file provided")

    def test_wrong_extension_is_rejected(self):
        response = self.post_file(
            "/api/standard/analyze-binary",
            "firmware.html",
            b"<script>alert(1)</script>",
            "text/html",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Unsupported file type", response.get_json()["error"])

    def test_too_large_upload_returns_json_413(self):
        original_limit = api_server.app.config["MAX_CONTENT_LENGTH"]
        api_server.app.config["MAX_CONTENT_LENGTH"] = 16
        try:
            response = self.post_file(
                "/api/standard/analyze-binary",
                "firmware.bin",
                b"A" * 1024,
                "application/octet-stream",
            )
        finally:
            api_server.app.config["MAX_CONTENT_LENGTH"] = original_limit

        self.assertEqual(response.status_code, 413)
        self.assertIn("too large", response.get_json()["error"].lower())

    def test_cors_allows_local_vite_origin(self):
        response = self.client.get(
            "/api/health",
            headers={"Origin": "http://localhost:5173"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Access-Control-Allow-Origin"], "http://localhost:5173")


if __name__ == "__main__":
    unittest.main()
