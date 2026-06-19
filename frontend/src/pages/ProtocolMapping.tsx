import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Eye, Filter, GitBranch, KeyRound, Network, RadioTower, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { NoirToolShell } from "@/components/layout/NoirToolShell";
import { useAnalysisStore } from "@/lib/analysis-store";
import type { AnalysisRun } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ProtocolNode {
  id: string;
  label: string;
  stage: string;
  confidence: number;
  primitive: string;
  offset: string;
  risk: "low" | "medium" | "high";
  x: number;
  y: number;
}

const familyMap = [
  { match: /aes|chacha|des|rc4|xor/i, stage: "Encrypt", primitive: "Cipher primitive" },
  { match: /sha|md5|blake|hash/i, stage: "Digest", primitive: "Integrity primitive" },
  { match: /rsa|ecc|ecdsa|ecdh|curve|dh/i, stage: "Identity", primitive: "Key exchange / signature" },
  { match: /sbox|round|schedule|custom|proprietary/i, stage: "Custom", primitive: "Proprietary transform" },
];

function probabilityFor(run: AnalysisRun, label: string, fallback: number) {
  const probabilities = run.details.probabilities;
  if (probabilities && typeof probabilities === "object") {
    const match = Object.entries(probabilities as Record<string, unknown>).find(
      ([key]) => key.toLowerCase() === label.toLowerCase(),
    );
    if (typeof match?.[1] === "number") {
      return match[1];
    }
  }

  if (typeof run.details.confidence === "number") {
    return run.details.confidence;
  }

  return fallback;
}

function riskFor(label: string, confidence: number, run: AnalysisRun): "low" | "medium" | "high" {
  if (/md5|sha-?1|des|rc4|xor|lcg|custom/i.test(label)) {
    return "high";
  }
  if (run.summary.riskLevel === "high" && confidence > 0.72) {
    return "high";
  }
  if (run.modelType === "proprietary" || confidence < 0.58) {
    return "medium";
  }
  return "low";
}

function buildNodes(run: AnalysisRun): ProtocolNode[] {
  const labels = run.summary.detectedLabels.length > 0 ? run.summary.detectedLabels : [run.summary.topPrediction];
  const radius = labels.length <= 3 ? 33 : 39;

  return labels.map((label, index) => {
    const angle = -Math.PI / 2 + (index / labels.length) * Math.PI * 2;
    const family = familyMap.find((item) => item.match.test(label));
    const confidence = probabilityFor(run, label, Math.max(0.42, 0.88 - index * 0.08));

    return {
      id: `${label}-${index}`,
      label,
      stage: family?.stage || "Detect",
      primitive: family?.primitive || "Unknown crypto signal",
      confidence,
      offset: `.text+0x${(0x1200 + index * 0x540).toString(16).toUpperCase()}`,
      risk: riskFor(label, confidence, run),
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
    };
  });
}

const ProtocolMapping = () => {
  const { latestRun, usingDemoData } = useAnalysisStore();
  const [highConfidenceOnly, setHighConfidenceOnly] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes = useMemo(() => buildNodes(latestRun), [latestRun]);
  const visibleNodes = highConfidenceOnly ? nodes.filter((node) => node.confidence >= 0.7) : nodes;
  const selected = visibleNodes.find((node) => node.id === selectedNode) || visibleNodes[0];

  return (
    <NoirToolShell
      eyebrow="protocol constellation"
      title="Trace the graph."
      copy="Detected primitives become a path through exchange, encryption, integrity, and custom transforms."
      tone="cyan"
    >
    <div className="space-y-6">
      <section className="command-panel p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="telemetry-label">{usingDemoData ? "demo protocol" : latestRun.runId}</p>
            <h1 className="mt-2 text-4xl font-semibold">Protocol Mapping</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Signals from the latest run are projected into a staged cryptographic flow so weak primitives and custom transforms are visible together.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
              <Filter className="h-4 w-4 text-cyan-200" />
              <span className="font-mono text-xs uppercase text-muted-foreground">70%+</span>
              <Switch checked={highConfidenceOnly} onCheckedChange={setHighConfidenceOnly} />
            </div>
            <Badge className={cn("border font-mono uppercase", `risk-${latestRun.summary.riskLevel}`)}>
              {latestRun.summary.riskLevel} risk
            </Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="command-panel overflow-hidden p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="telemetry-label">graph projection</p>
              <h2 className="mt-1 text-xl font-semibold">{latestRun.input.filename}</h2>
            </div>
            <Network className="h-5 w-5 text-cyan-200" />
          </div>

          <div className="relative h-[420px] overflow-hidden rounded-md border border-white/10 bg-black/40">
            <div className="scanline" />
            <svg className="absolute inset-0 h-full w-full" role="presentation">
              <defs>
                <linearGradient id="protocol-edge" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="rgba(56, 189, 248, 0.2)" />
                  <stop offset="100%" stopColor="rgba(52, 211, 153, 0.75)" />
                </linearGradient>
              </defs>
              {visibleNodes.map((node, index) => {
                const next = visibleNodes[(index + 1) % visibleNodes.length];
                return (
                  <line
                    key={`${node.id}-${next.id}`}
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2={`${next.x}%`}
                    y2={`${next.y}%`}
                    stroke="url(#protocol-edge)"
                    strokeDasharray="6 8"
                    strokeWidth="1.5"
                  />
                );
              })}
              {visibleNodes.map((node) => (
                <line
                  key={`core-${node.id}`}
                  x1="50%"
                  y1="50%"
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
              ))}
            </svg>

            <motion.div
              className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/10 shadow-[0_0_60px_rgba(52,211,153,0.18)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            >
              <RadioTower className="h-8 w-8 text-emerald-200" />
            </motion.div>

            {visibleNodes.map((node, index) => (
              <motion.button
                key={node.id}
                className={cn(
                  "absolute z-20 w-40 -translate-x-1/2 -translate-y-1/2 rounded-md border bg-background/90 p-3 text-left shadow-2xl backdrop-blur",
                  selectedNode === node.id ? "border-cyan-200/80" : "border-white/10",
                  `risk-${node.risk}`,
                )}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                initial={{ opacity: 0, scale: 0.72 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold">{node.label}</span>
                  <span className="font-mono text-xs">{Math.round(node.confidence * 100)}%</span>
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">{node.stage}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="command-panel p-5">
            <p className="telemetry-label">selected signal</p>
            {selected ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <KeyRound className="h-6 w-6 text-cyan-200" />
                  <div>
                    <h2 className="text-2xl font-semibold">{selected.label}</h2>
                    <p className="font-mono text-xs uppercase text-muted-foreground">{selected.offset}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selected.primitive}</p>
                <Badge className={cn("border font-mono uppercase", `risk-${selected.risk}`)}>{selected.risk}</Badge>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No signals match the current filter.</p>
            )}
          </div>

          <div className="command-panel p-5">
            <p className="telemetry-label">sequence</p>
            <div className="mt-4 space-y-3">
              {visibleNodes.map((node, index) => (
                <button
                  key={node.id}
                  className="flex w-full items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 text-left hover:border-cyan-200/40"
                  onClick={() => setSelectedNode(node.id)}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-mono text-xs text-cyan-100">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{node.stage}</span>
                    <span className="block truncate font-mono text-xs uppercase text-muted-foreground">{node.label}</span>
                  </span>
                  <Eye className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="command-panel p-5">
          <GitBranch className="mb-3 h-5 w-5 text-emerald-200" />
          <p className="telemetry-label">flow nodes</p>
          <p className="metric-number mt-2">{visibleNodes.length}</p>
        </div>
        <div className="command-panel p-5">
          <ShieldCheck className="mb-3 h-5 w-5 text-cyan-200" />
          <p className="telemetry-label">model family</p>
          <p className="metric-number mt-2 capitalize">{latestRun.modelType}</p>
        </div>
        <div className="command-panel p-5">
          <RadioTower className="mb-3 h-5 w-5 text-amber-200" />
          <p className="telemetry-label">top prediction</p>
          <p className="mt-2 truncate text-2xl font-semibold">{latestRun.summary.topPrediction}</p>
        </div>
      </section>
    </div>
    </NoirToolShell>
  );
};

export default ProtocolMapping;
