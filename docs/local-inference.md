# Local Inference Workflow

This guide shows how to run both model pipelines against the bundled sample datasets without using the web UI.

## Run Through the API

Start the server from the repository root:

```powershell
python api_server.py
```

Then submit the bundled CSVs:

```powershell
curl.exe -X POST "http://localhost:5000/api/standard/inference?format=json" `
  -F "file=@datasets/Standard/standard_test_dataset.csv"
```

```powershell
curl.exe -X POST "http://localhost:5000/api/proprietary/inference?format=json" `
  -F "file=@datasets/Proprietary/proprietary_data_test.csv"
```

## Run Models Individually

### Standard model

```powershell
cd standard_model
python run_inference_simple.py
```

- Input: `datasets/Standard/standard_test_dataset.csv`
- Output: `datasets/Standard/standard_test_dataset_results.csv`

### Proprietary model

```powershell
cd proprietary_model
python run_inference_simple.py
```

- Input: `datasets/Proprietary/proprietary_data_test.csv`
- Output: `datasets/Proprietary/proprietary_data_test_results.csv`

## Output Summary

### Standard model output

- `fileId`
- per-label confidence columns such as `aes_confidence` and `sha256_confidence`
- `detected_algorithms`
- `top_predictions`
- signature feature flags

### Proprietary model output

- `fileId`
- `algorithm_name`
- `operation`
- `confidence`
- proprietary feature flags such as `has_sbox` and `key_schedule`
- `recommendations`

## Troubleshooting

- Verify checkpoint files exist:
  - `standard_model/checkpoints/standard_model.pt`
  - `proprietary_model/checkpoints/proprietary_model.pt`
- Verify sample CSV files still exist under `datasets/`.
- Install required Python dependencies before running inference.
