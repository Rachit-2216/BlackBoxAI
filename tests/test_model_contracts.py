import unittest

import torch

from proprietary_model import inference as proprietary_inference
from proprietary_model.inference import ProprietaryInference
from standard_model import inference as standard_inference
from standard_model.inference import CryptoDetector


class FakeTransformer:
    def get_embeddings(self, _opcode_ids):
        return torch.zeros((1, 1024), dtype=torch.float32)


class FakeFusion:
    def __call__(self, *_args, **_kwargs):
        return torch.tensor([[3.0, 1.0, 0.2]], dtype=torch.float32)


class FakeSignatureScanner:
    def get_feature_names(self):
        return [
            "HAS_SBOX",
            "HAS_PERMUTATION",
            "HAS_ROUNDS",
            "HAS_KEY_SCHEDULE",
            "BITWISE_HEAVY",
            "ARITHMETIC_HEAVY",
            "HIGH_ENTROPY",
            "LOOP_STRUCTURE",
        ]


class ModelContractTest(unittest.TestCase):
    def test_checkpoint_legacy_import_aliases_are_available(self):
        with standard_inference.checkpoint_import_aliases():
            self.assertIn("utils.opcode_tokenizer", standard_inference.sys.modules)
            self.assertIn("models.signature_scanner", standard_inference.sys.modules)

        with proprietary_inference.checkpoint_import_aliases():
            self.assertIn("utils.proprietary_tokenizer", proprietary_inference.sys.modules)
            self.assertIn("models.proprietary_fusion", proprietary_inference.sys.modules)

    def test_standard_opcode_extraction_is_deterministic_for_same_binary(self):
        detector = CryptoDetector.__new__(CryptoDetector)
        binary = bytes(range(64)) * 8

        first = detector.disassemble_to_opcodes(binary)
        second = detector.disassemble_to_opcodes(binary)

        self.assertEqual(first, second)

    def test_proprietary_analysis_includes_report_contract_fields(self):
        engine = ProprietaryInference.__new__(ProprietaryInference)
        engine.device = torch.device("cpu")
        engine.operation_labels = ["CustomXOR", "RotaryHash", "KeyScheduler"]
        engine.signature_scanner = FakeSignatureScanner()
        engine.transformer = FakeTransformer()
        engine.fusion = FakeFusion()
        engine._predict_algorithm_name = lambda *_args: "CustomXOR"
        engine._prepare_features = lambda _binary: {
            "opcode_ids": torch.ones((1, 8), dtype=torch.long),
            "signature_features": torch.tensor(
                [[0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0]],
                dtype=torch.float32,
            ),
            "entropy_vector": torch.zeros((1, 16), dtype=torch.float32),
            "metadata_vector": torch.zeros((1, 25), dtype=torch.float32),
        }

        result = engine.analyze_binary(b"\x31\xc0\xd1\xc8" * 8)

        self.assertEqual(result["algorithm_name"], "CustomXOR")
        self.assertEqual(result["operation"], "CustomXOR")
        self.assertGreater(result["confidence"], 0.0)
        self.assertTrue(result["recommendations"])


if __name__ == "__main__":
    unittest.main()
