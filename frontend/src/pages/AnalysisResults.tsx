import { useState } from "react";
import { Calendar, Copy, FileSearch, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NoirToolShell } from "@/components/layout/NoirToolShell";
import { useAnalysisStore } from "@/lib/analysis-store";
import type { AnalysisRun } from "@/lib/api";
import { cn } from "@/lib/utils";

function formatDate(value?: string) {
  if (!value) {
    return "demo";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatBytes(size: number) {
  if (size > 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(size / 1024).toFixed(1)} KB`;
}

function getProbabilities(run: AnalysisRun) {
  const probabilities = run.details.probabilities;
  if (!probabilities || typeof probabilities !== "object") {
    return [];
  }
  return Object.entries(probabilities as Record<string, number>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
}

const AnalysisResults = () => {
  const { displayRuns, clearRuns, usingDemoData } = useAnalysisStore();
  const [selectedRun, setSelectedRun] = useState<AnalysisRun | null>(displayRuns[0] || null);

  const copyRunId = async (runId: string) => {
    await navigator.clipboard.writeText(runId);
    toast.success("Run ID copied.");
  };

  return (
    <NoirToolShell
      eyebrow="evidence wall"
      title="Proof stays visible."
      copy="Run memory, model confidence, file hash, and raw contract stay one click away."
      tone="green"
    >
    <div className="space-y-6">
      <section className="command-panel p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="telemetry-label">{usingDemoData ? "demo fallback" : "local memory"}</p>
            <h1 className="mt-2 text-4xl font-semibold">Analysis Results</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-white/15">
              <Calendar className="mr-2 h-4 w-4" />
              {displayRuns.length} runs
            </Button>
            <Button
              variant="outline"
              className="border-red-300/20 text-red-100 hover:bg-red-400/10"
              disabled={usingDemoData}
              onClick={clearRuns}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear local
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "highest risk", value: Math.max(...displayRuns.map((run) => run.summary.riskScore)) },
          { label: "stored runs", value: displayRuns.length },
          { label: "latest model", value: displayRuns[0]?.modelType || "standard" },
        ].map((metric) => (
          <div key={metric.label} className="command-panel p-5">
            <p className="telemetry-label">{metric.label}</p>
            <p className="metric-number mt-2 capitalize">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="command-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>File</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Signal</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>When</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRuns.map((run) => (
              <TableRow
                key={run.runId}
                className="cursor-pointer border-white/10 hover:bg-white/[0.04]"
                onClick={() => setSelectedRun(run)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <FileSearch className="h-4 w-4 text-cyan-200" />
                    <div className="min-w-0">
                      <p className="max-w-[320px] truncate font-medium">{run.input.filename}</p>
                      <p className="font-mono text-xs uppercase text-muted-foreground">{formatBytes(run.input.size)} / {run.input.kind}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{run.modelType}</TableCell>
                <TableCell>{run.summary.topPrediction}</TableCell>
                <TableCell>
                  <Badge className={cn("border font-mono uppercase", `risk-${run.summary.riskLevel}`)}>
                    {run.summary.riskScore} / {run.summary.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{formatDate(run.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      copyRunId(run.runId);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <Sheet open={Boolean(selectedRun)} onOpenChange={(open) => !open && setSelectedRun(null)}>
        <SheetContent className="w-full overflow-y-auto border-white/10 bg-background sm:max-w-2xl">
          {selectedRun && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">{selectedRun.input.filename}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className={cn("border p-4", `risk-${selectedRun.summary.riskLevel}`)}>
                  <p className="telemetry-label">risk score</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="metric-number">{selectedRun.summary.riskScore}</span>
                    <span className="font-mono text-sm uppercase">{selectedRun.summary.riskLevel}</span>
                  </div>
                </div>

                <div>
                  <p className="telemetry-label mb-3">detected labels</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRun.summary.detectedLabels.map((label) => (
                      <Badge key={label} variant="outline" className="border-cyan-300/30 text-cyan-100">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {getProbabilities(selectedRun).length > 0 && (
                  <div>
                    <p className="telemetry-label mb-3">probabilities</p>
                    <div className="space-y-3">
                      {getProbabilities(selectedRun).map(([label, value]) => (
                        <div key={label}>
                          <div className="mb-2 flex justify-between font-mono text-xs uppercase">
                            <span>{label}</span>
                            <span>{Math.round(value * 100)}%</span>
                          </div>
                          <Progress value={Math.round(value * 100)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="telemetry-label mb-3">raw contract</p>
                  <pre className="max-h-96 overflow-auto border border-white/10 bg-black/40 p-4 text-xs">
                    {JSON.stringify(selectedRun, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
    </NoirToolShell>
  );
};

export default AnalysisResults;
