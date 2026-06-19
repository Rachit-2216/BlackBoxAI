import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Binary, Database, Download, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NoirToolShell } from "@/components/layout/NoirToolShell";
import {
  analyzeProprietaryBinary,
  analyzeProprietaryCsv,
  analyzeStandardBinary,
  analyzeStandardCsv,
  type AnalysisRun,
  type InputKind,
  type ModelType,
} from "@/lib/api";
import { useAnalysisStore } from "@/lib/analysis-store";
import { cn } from "@/lib/utils";

const modelOptions: Array<{ value: ModelType; label: string; detail: string }> = [
  { value: "standard", label: "Standard", detail: "AES, RSA, SHA, MD5, HMAC, ECC" },
  { value: "proprietary", label: "Proprietary", detail: "CustomXOR, RotaryHash, KeyScheduler" },
];

const inputOptions: Array<{ value: InputKind; label: string; icon: typeof FileSpreadsheet; accept: string }> = [
  { value: "csv", label: "CSV dataset", icon: FileSpreadsheet, accept: ".csv" },
  { value: "binary", label: "Firmware binary", icon: Binary, accept: ".bin,.elf,.hex,.fw,.img,.rom" },
];

function isCsv(file: File) {
  return file.name.toLowerCase().endsWith(".csv");
}

function isBinary(file: File) {
  return [".bin", ".elf", ".hex", ".fw", ".img", ".rom"].some((extension) =>
    file.name.toLowerCase().endsWith(extension),
  );
}

const Upload = () => {
  const { addRun } = useAnalysisStore();
  const [modelType, setModelType] = useState<ModelType>("standard");
  const [inputKind, setInputKind] = useState<InputKind>("binary");
  const [csvOutput, setCsvOutput] = useState<"json" | "csv">("json");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const accept = useMemo(
    () => inputOptions.find((option) => option.value === inputKind)?.accept || ".csv",
    [inputKind],
  );

  const handleFile = (candidate: File | null) => {
    if (!candidate) {
      setFile(null);
      return;
    }

    if (inputKind === "csv" && !isCsv(candidate)) {
      toast.error("Select a CSV file for dataset inference.");
      setFile(null);
      return;
    }

    if (inputKind === "binary" && !isBinary(candidate)) {
      toast.error("Select a firmware file with .bin, .elf, .hex, .fw, .img, or .rom extension.");
      setFile(null);
      return;
    }

    setFile(candidate);
  };

  const runAnalysis = async () => {
    if (!file) {
      toast.error("Select a file first.");
      return;
    }

    setProcessing(true);
    setProgress(8);
    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(92, current + 9));
    }, 350);

    try {
      let result: AnalysisRun | void;
      if (inputKind === "binary") {
        result = modelType === "standard"
          ? await analyzeStandardBinary(file)
          : await analyzeProprietaryBinary(file);
      } else {
        result = modelType === "standard"
          ? await analyzeStandardCsv(file, csvOutput)
          : await analyzeProprietaryCsv(file, csvOutput);
      }

      setProgress(100);
      if (result) {
        addRun(result);
        toast.success("Analysis stored in local run memory.");
      } else {
        toast.success("CSV download started.");
      }
    } catch (error) {
      setProgress(0);
      toast.error(error instanceof Error ? error.message : "Analysis failed.");
    } finally {
      window.clearInterval(progressTimer);
      window.setTimeout(() => {
        setProcessing(false);
        setProgress(0);
      }, 700);
    }
  };

  return (
    <NoirToolShell
      eyebrow="firmware-ingest"
      title="Ingest workbench."
      copy="Choose the model path, stage the sample, and send it through the same evidence pipeline shown on the landing surface."
      tone="cyan"
    >
    <div className="firmware-ingest airlock-grid">
      <section className="command-panel p-6">
        <p className="telemetry-label">ingest</p>
        <h2 className="mt-2 text-4xl font-semibold uppercase">sample controls</h2>
        <p className="mt-3 text-muted-foreground">
          CSV becomes report data. Binary becomes a live firmware read.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <p className="telemetry-label mb-3">model track</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {modelOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setModelType(option.value)}
                  disabled={processing}
                  className={cn(
                    "border p-4 text-left transition-colors",
                    modelType === option.value
                      ? "border-cyan-300/40 bg-cyan-300/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20",
                  )}
                >
                  <span className="text-lg font-semibold">{option.label}</span>
                  <span className="mt-2 block text-sm text-muted-foreground">{option.detail}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="telemetry-label mb-3">input type</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {inputOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setInputKind(option.value);
                    setFile(null);
                  }}
                  disabled={processing}
                  className={cn(
                    "flex items-center gap-3 border p-4 text-left transition-colors",
                    inputKind === option.value
                      ? "border-emerald-300/40 bg-emerald-300/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20",
                  )}
                >
                  <option.icon className="h-5 w-5 text-emerald-200" />
                  <span className="font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {inputKind === "csv" && (
            <div>
              <p className="telemetry-label mb-3">CSV output</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: "json", label: "Interactive JSON", icon: Database },
                  { value: "csv", label: "Download CSV", icon: Download },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCsvOutput(option.value as "json" | "csv")}
                    disabled={processing}
                    className={cn(
                      "flex items-center gap-3 border p-4 text-left transition-colors",
                      csvOutput === option.value
                        ? "border-cyan-300/40 bg-cyan-300/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20",
                    )}
                  >
                    <option.icon className="h-5 w-5 text-cyan-200" />
                    <span className="font-semibold">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="command-panel p-6">
        <p className="telemetry-label">sealed chamber</p>
        <label
          htmlFor="analysis-file"
          className={cn(
            "mt-4 grid min-h-[360px] cursor-pointer place-items-center border border-dashed p-8 text-center transition-colors",
            file ? "border-emerald-300/40 bg-emerald-300/10" : "border-cyan-300/30 bg-cyan-300/[0.04] hover:bg-cyan-300/[0.07]",
          )}
        >
          <input
            id="analysis-file"
            type="file"
            accept={accept}
            className="hidden"
            disabled={processing}
            onChange={(event) => handleFile(event.target.files?.[0] || null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <div className="mx-auto grid h-20 w-20 place-items-center border border-cyan-300/40 bg-black/30">
              <UploadCloud className="h-10 w-10 text-cyan-200" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{file ? file.name : "Select analysis input"}</h2>
              <p className="mt-2 font-mono text-sm text-muted-foreground">
                {file ? `${(file.size / 1024).toFixed(2)} KB queued` : accept}
              </p>
            </div>
          </motion.div>
        </label>

        {processing && (
          <div className="mt-5 space-y-2">
            <Progress value={progress} />
            <p className="font-mono text-xs uppercase text-muted-foreground">processing {progress}%</p>
          </div>
        )}

        <Button
          onClick={runAnalysis}
          disabled={!file || processing}
          className="mt-6 w-full cyber-button"
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Start analysis
            </>
          )}
        </Button>

        <div className="mt-6 flex gap-3 border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Browser validation is for feedback only. The Flask API enforces extension and upload-size checks before inference.
          </p>
        </div>
      </section>
    </div>
    </NoirToolShell>
  );
};

export default Upload;
