export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export type ModelType = "standard" | "proprietary";
export type InputKind = "csv" | "binary";
export type RiskLevel = "low" | "medium" | "high";

export interface HealthResponse {
  status: string;
  proprietary_loaded: boolean;
  standard_loaded: boolean;
}

export interface ModelInfoResponse {
  models: {
    standard: {
      labels: string[];
      threshold: number;
      description: string;
    };
    proprietary: {
      labels: string[];
      algorithmFamilies: string[];
      threshold: number;
      description: string;
    };
  };
  upload: {
    maxUploadMb: number;
    csvExtensions: string[];
    binaryExtensions: string[];
  };
}

export interface AnalysisSummary {
  detectedLabels: string[];
  topPrediction: string;
  riskScore: number;
  riskLevel: RiskLevel;
}

export interface AnalysisInput {
  filename: string;
  size: number;
  sha256: string;
  kind: InputKind;
}

export interface AnalysisRun {
  runId: string;
  modelType: ModelType;
  input: AnalysisInput;
  summary: AnalysisSummary;
  rows?: Record<string, unknown>[];
  details: Record<string, unknown>;
  createdAt?: string;
}

async function parseError(response: Response): Promise<Error> {
  const payload = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
  return new Error(payload.error || `HTTP ${response.status}`);
}

async function postMultipart(endpoint: string, file: File): Promise<Response> {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });
}

async function postJson(endpoint: string, file: File): Promise<AnalysisRun> {
  const response = await postMultipart(endpoint, file);
  if (!response.ok) {
    throw await parseError(response);
  }

  const payload = (await response.json()) as AnalysisRun;
  return {
    ...payload,
    createdAt: new Date().toISOString(),
  };
}

async function downloadCsv(endpoint: string, file: File, prefix: string): Promise<void> {
  const response = await postMultipart(endpoint, file);

  if (!response.ok) {
    throw await parseError(response);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${prefix}_results_${Date.now()}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(anchor);
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error("API health check failed");
  }
  return response.json();
}

export async function getModelInfo(): Promise<ModelInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/model-info`);
  if (!response.ok) {
    throw new Error("API model-info request failed");
  }
  return response.json();
}

export function analyzeStandardCsv(file: File, output: "csv" | "json"): Promise<AnalysisRun | void> {
  if (output === "csv") {
    return downloadCsv("/api/standard/inference", file, "standard");
  }
  return postJson("/api/standard/inference?format=json", file);
}

export function analyzeProprietaryCsv(file: File, output: "csv" | "json"): Promise<AnalysisRun | void> {
  if (output === "csv") {
    return downloadCsv("/api/proprietary/inference", file, "proprietary");
  }
  return postJson("/api/proprietary/inference?format=json", file);
}

export function analyzeStandardBinary(file: File): Promise<AnalysisRun> {
  return postJson("/api/standard/analyze-binary", file);
}

export function analyzeProprietaryBinary(file: File): Promise<AnalysisRun> {
  return postJson("/api/proprietary/analyze-binary", file);
}
