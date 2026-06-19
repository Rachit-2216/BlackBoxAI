import type { AnalysisRun } from "./api";

export const sampleRuns: AnalysisRun[] = [
  {
    runId: "demo-standard-aes",
    modelType: "standard",
    createdAt: "2026-06-19T08:00:00.000Z",
    input: {
      filename: "router_firmware_v2.1.4.bin",
      size: 2457600,
      sha256: "ed37f27b002be3dcf800bc52d2e678cb983d35365e329d6ca9a8aec280ba8978",
      kind: "binary",
    },
    summary: {
      detectedLabels: ["aes", "sha256", "rsa"],
      topPrediction: "aes",
      riskScore: 76,
      riskLevel: "high",
    },
    details: {
      probabilities: {
        aes: 0.94,
        sha256: 0.88,
        rsa: 0.61,
        md5: 0.12,
      },
      signature_features: {
        AES_SBOX_FOUND: true,
        SHA256_CONST_FOUND: true,
        MD5_CONST_FOUND: false,
        ECC_PARAM_FOUND: false,
        RSA_ASN1_FOUND: true,
        ENTROPY_HIGH: true,
      },
      entropy_regions: [[4096, 8192]],
      metadata: {
        arch_type: "ARM",
        file_size: 2457600,
        num_sections: 9,
        is_ELF: true,
        is_BIN: false,
      },
    },
  },
  {
    runId: "demo-proprietary-xor",
    modelType: "proprietary",
    createdAt: "2026-06-19T08:05:00.000Z",
    input: {
      filename: "industrial_plc_custom_crypto.bin",
      size: 1373000,
      sha256: "f6d7e45b45d7f169cfc94712f82ae2ada0c454728701e11d7bfcb13fc5e731ef",
      kind: "binary",
    },
    summary: {
      detectedLabels: ["CustomXOR"],
      topPrediction: "CustomXOR",
      riskScore: 83,
      riskLevel: "high",
    },
    details: {
      algorithm_name: "CustomXOR",
      operation: "CustomXOR",
      confidence: 0.86,
      has_sbox: 0,
      has_permutation: 0,
      has_rounds: 1,
      key_schedule: 1,
      bitwise_heavy: 1,
      arithmetic_heavy: 0,
      proprietary: 1,
      recommendations: ["Custom bitwise-heavy cipher detected; review key scheduling and entropy source manually."],
    },
  },
];
