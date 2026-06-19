import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Code2, Copy, Database, FileDown, Server, ShieldAlert, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoirToolShell } from "@/components/layout/NoirToolShell";
import { API_BASE_URL, getModelInfo } from "@/lib/api";

const endpoints = [
  {
    method: "GET",
    path: "/api/health",
    description: "Health check for Render and the frontend status chip.",
  },
  {
    method: "GET",
    path: "/api/model-info",
    description: "Labels, thresholds, file allowlists, and max upload size.",
  },
  {
    method: "POST",
    path: "/api/standard/inference?format=json",
    description: "CSV upload with standard model JSON response.",
  },
  {
    method: "POST",
    path: "/api/proprietary/inference?format=json",
    description: "CSV upload with proprietary model JSON response.",
  },
  {
    method: "POST",
    path: "/api/standard/analyze-binary",
    description: "Multipart firmware upload through the standard opcode/signature pipeline.",
  },
  {
    method: "POST",
    path: "/api/proprietary/analyze-binary",
    description: "Multipart firmware upload through proprietary-feature detection.",
  },
];

const curlJson = `curl -X POST "${API_BASE_URL}/api/standard/inference?format=json" \\
  -F "file=@datasets/Standard/standard_test_dataset.csv"`;

const curlBinary = `curl -X POST "${API_BASE_URL}/api/proprietary/analyze-binary" \\
  -F "file=@firmware-sample.bin"`;

const viteEnv = `# Vercel project root: frontend
# Build command: npm run build
# Output directory: dist
VITE_API_URL=https://your-render-api.onrender.com
VITE_HEYGEN_PROMO_URL=`;

const tsExample = `import { analyzeStandardBinary } from "./lib/api";

const run = await analyzeStandardBinary(file);
console.log(run.summary.topPrediction, run.summary.riskScore);`;

async function copy(value: string) {
  await navigator.clipboard.writeText(value);
  toast.success("Copied.");
}

const Snippet = ({ title, value }: { title: string; value: string }) => (
  <div className="command-panel p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Code2 className="h-5 w-5 text-cyan-200" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <Button variant="ghost" size="icon" onClick={() => copy(value)}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
    <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md border border-white/10 bg-black/45 p-4 text-xs text-cyan-50">
      {value}
    </pre>
  </div>
);

const ApiIntegration = () => {
  const { data: modelInfo, isLoading, isError } = useQuery({
    queryKey: ["model-info"],
    queryFn: getModelInfo,
    retry: 1,
  });

  return (
    <NoirToolShell
      eyebrow="terminal surface"
      title="Call the core."
      copy="The frontend speaks to Render through VITE_API_URL. CSV reports and JSON runs use the same inference surface."
      tone="green"
    >
    <div className="space-y-6">
      <section className="command-panel p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="telemetry-label">integration surface</p>
            <h1 className="mt-2 text-4xl font-semibold">API Integration</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              The Vite app reads `VITE_API_URL`, calls the Render-hosted Flask service, and keeps CSV downloads available beside JSON analysis runs.
            </p>
          </div>
          <Badge className="border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 font-mono uppercase text-cyan-50">
            {API_BASE_URL}
          </Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="command-panel p-5">
          <Server className="mb-4 h-6 w-6 text-cyan-200" />
          <p className="telemetry-label">backend</p>
          <p className="mt-2 font-semibold">Flask + Gunicorn</p>
        </div>
        <div className="command-panel p-5">
          <UploadCloud className="mb-4 h-6 w-6 text-emerald-200" />
          <p className="telemetry-label">max upload</p>
          <p className="mt-2 font-semibold">
            {isLoading ? "loading" : isError ? "25 MB default" : `${modelInfo?.upload.maxUploadMb} MB`}
          </p>
        </div>
        <div className="command-panel p-5">
          <FileDown className="mb-4 h-6 w-6 text-amber-200" />
          <p className="telemetry-label">csv mode</p>
          <p className="mt-2 font-semibold">CSV or JSON</p>
        </div>
        <div className="command-panel p-5">
          <ShieldAlert className="mb-4 h-6 w-6 text-red-200" />
          <p className="telemetry-label">auth</p>
          <p className="mt-2 font-semibold">No accounts v1</p>
        </div>
      </section>

      <section className="command-panel overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <p className="telemetry-label">public endpoints</p>
        </div>
        <div className="divide-y divide-white/10">
          {endpoints.map((endpoint) => (
            <div key={endpoint.path} className="grid gap-3 p-5 md:grid-cols-[120px_1fr_1.2fr] md:items-center">
              <Badge className="w-fit border border-emerald-300/30 bg-emerald-300/10 font-mono text-emerald-50">
                {endpoint.method}
              </Badge>
              <code className="break-all font-mono text-sm text-cyan-100">{endpoint.path}</code>
              <p className="text-sm text-muted-foreground">{endpoint.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Snippet title="CSV JSON" value={curlJson} />
        <Snippet title="Binary Upload" value={curlBinary} />
        <Snippet title="Frontend Helper" value={tsExample} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Snippet title="Vercel Env" value={viteEnv} />

        <div className="command-panel p-5">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-200" />
            <h2 className="font-semibold">Model Info</h2>
          </div>
          {isError ? (
            <p className="mt-4 text-sm text-muted-foreground">API is unreachable, so upload constraints are shown by local fallback in the app shell.</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                <p className="telemetry-label">standard labels</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(modelInfo?.models.standard.labels || ["aes", "rsa", "sha256"]).map((label) => (
                    <Badge key={label} variant="outline" className="border-cyan-300/30 text-cyan-100">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                <p className="telemetry-label">allowed binary</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(modelInfo?.upload.binaryExtensions || [".bin", ".elf"]).map((ext) => (
                    <Badge key={ext} variant="outline" className="border-emerald-300/30 text-emerald-100">
                      {ext}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-200" />
            SPA fallback and security headers live in `frontend/vercel.json`.
          </div>
        </div>
      </section>
    </div>
    </NoirToolShell>
  );
};

export default ApiIntegration;
