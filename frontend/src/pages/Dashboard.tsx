import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Binary,
  Braces,
  Database,
  FileSearch,
  Gauge,
  GitBranch,
  Network,
  RadioTower,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";
import ProtocolMotionField from "@/components/cyber/ProtocolMotionField";
import ShardGuide from "@/components/cyber/ShardGuide";
import ScrollChapter from "@/components/cyber/ScrollChapter";
import { Button } from "@/components/ui/button";
import { useAnalysisStore } from "@/lib/analysis-store";
import { cn } from "@/lib/utils";

const proofModules = [
  {
    id: "01",
    gate: "INGEST",
    title: "Upload firmware",
    detail: "Binary analysis cockpit",
    to: "/upload",
    icon: UploadCloud,
    tone: "green",
  },
  {
    id: "02",
    gate: "DISASSEMBLE",
    title: "Analyze CSV",
    detail: "Model inference pipeline",
    to: "/upload",
    icon: Database,
    tone: "cyan",
  },
  {
    id: "03",
    gate: "DETECT",
    title: "Inspect evidence",
    detail: "Opcode stream + signatures",
    to: "/results",
    icon: FileSearch,
    tone: "amber",
  },
  {
    id: "04",
    gate: "MAP",
    title: "Explore map",
    detail: "Protocols and flows",
    to: "/protocol",
    icon: Network,
    tone: "cyan",
  },
  {
    id: "05",
    gate: "REPORT",
    title: "View full report",
    detail: "Risk and evidence",
    to: "/compliance",
    icon: ShieldAlert,
    tone: "red",
  },
];

const journeyChapters = [
  {
    eyebrow: "01 / INGEST",
    title: "One sample enters.",
    copy: "The binary hits the ingest workbench, gets hashed, typed, and staged for standard or proprietary inference.",
    accent: "green" as const,
  },
  {
    eyebrow: "02 / DISASSEMBLE",
    title: "Memory opens below.",
    copy: "Opcode streams, entropy bands, and file metadata turn the firmware into terrain the analyst can read.",
    accent: "cyan" as const,
  },
  {
    eyebrow: "03 / DETECT",
    title: "Weak crypto lights up.",
    copy: "Signatures, probabilities, and custom-feature detections separate real evidence from noise.",
    accent: "red" as const,
  },
  {
    eyebrow: "04 / MAP",
    title: "Protocols become paths.",
    copy: "Detected primitives become a constellation of identity, transport, integrity, and custom transforms.",
    accent: "amber" as const,
  },
  {
    eyebrow: "05 / REPORT",
    title: "Truth leaves the box.",
    copy: "The run returns as a compact evidence contract: labels, risk, hash, probabilities, metadata, and remediation.",
    accent: "green" as const,
  },
];

function formatBytes(size: number) {
  if (size > 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }
  return `${(size / 1024).toFixed(1)} KB`;
}

function SuspiciousSamplePanel() {
  const { latestRun } = useAnalysisStore();

  return (
    <motion.aside
      className="sample-card"
      initial={{ opacity: 0, x: 42 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.16, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="sample-card__header">
        <span>Suspicious sample</span>
        <strong>{latestRun.summary.riskLevel} risk</strong>
      </div>
      <h2>{latestRun.input.filename}</h2>
      <dl>
        <div>
          <dt>Size</dt>
          <dd>{formatBytes(latestRun.input.size)}</dd>
        </div>
        <div>
          <dt>SHA256</dt>
          <dd>{latestRun.input.sha256.slice(0, 10)}...</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{latestRun.input.kind}</dd>
        </div>
        <div>
          <dt>Model</dt>
          <dd>{latestRun.modelType}</dd>
        </div>
      </dl>
      <Link to="/results">
        View sample details
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.aside>
  );
}

function TelemetryPanel() {
  const { latestRun } = useAnalysisStore();
  const rows = [
    { label: "entropy", value: "7.94", tone: "green", width: "74%" },
    { label: "complexity", value: "0.72", tone: "cyan", width: "62%" },
    { label: "suspicious", value: `${latestRun.summary.riskScore / 100}`, tone: "red", width: `${latestRun.summary.riskScore}%` },
    { label: "strings", value: "2,341", tone: "green", width: "56%" },
  ];

  return (
    <motion.aside
      className="telemetry-card"
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.24, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="telemetry-label">telemetry</p>
      {rows.map((row) => (
        <div className="telemetry-row" key={row.label}>
          <div>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
          <div className="telemetry-track">
            <i className={`telemetry-track__bar is-${row.tone}`} style={{ width: row.width }} />
          </div>
        </div>
      ))}
      <small>Live analysis feed</small>
    </motion.aside>
  );
}

function ProofStrip() {
  return (
    <div className="proof-strip">
      {proofModules.map((module, index) => {
        const Icon = module.icon;
        return (
          <motion.div
            key={module.gate}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to={module.to} className={cn("scroll-gate-card", `is-${module.tone}`)}>
              <span className="scroll-gate-card__id">{module.id}</span>
              <span>
                <strong>{module.gate}</strong>
                <em>{module.detail}</em>
              </span>
              <Icon className="h-5 w-5" />
              <b>{module.title}</b>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

function AnalysisCorridor() {
  const stages = [
    { id: "01", label: "hash lock", value: "sha256", bars: [44, 62, 38, 76, 58], tone: "green" },
    { id: "02", label: "memory field", value: "7.94 entropy", bars: [24, 78, 54, 91, 68], tone: "amber" },
    { id: "03", label: "signature hit", value: "AES/SBOX", bars: [88, 54, 72, 42, 95], tone: "red" },
    { id: "04", label: "protocol edge", value: "custom:8833", bars: [36, 48, 82, 65, 74], tone: "cyan" },
  ];

  return (
    <div className="analysis-corridor">
      <div className="analysis-corridor__rail">
        <motion.i
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {stages.map((stage, index) => (
        <motion.article
          key={stage.id}
          className={cn("analysis-node", `is-${stage.tone}`)}
          initial={{ opacity: 0, y: 34, rotateX: -18 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: false, amount: 0.32 }}
          transition={{ delay: index * 0.08, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>{stage.id}</span>
          <h3>{stage.label}</h3>
          <strong>{stage.value}</strong>
          <div className="analysis-node__bars" aria-hidden="true">
            {stage.bars.map((height, barIndex) => (
              <motion.i
                key={`${stage.id}-${barIndex}`}
                initial={{ height: "12%" }}
                whileInView={{ height: `${height}%` }}
                viewport={{ once: false, amount: 0.45 }}
                transition={{ delay: 0.12 + barIndex * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function FragmentPoolStage() {
  const fragments = Array.from({ length: 34 }, (_, index) => ({
    id: `surface-fragment-${index}`,
    left: `${18 + ((index * 19) % 64)}%`,
    top: `${18 + ((index * 23) % 58)}%`,
    rotate: index * 21 - 120,
    size: 0.52 + (index % 5) * 0.15,
    delay: index * 0.035,
  }));

  return (
    <motion.div
      className="surface-fragment-pool"
      initial={{ opacity: 0, y: 40, rotateX: -14 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: false, amount: 0.28 }}
      transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      <div className="surface-fragment-pool__core">
        <span />
        <strong>fragment source</strong>
      </div>
      <svg viewBox="0 0 960 260" preserveAspectRatio="none">
        <motion.path
          d="M 468 132 C 322 42 206 76 68 28"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d="M 484 130 C 604 40 734 52 916 82"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d="M 476 138 C 556 232 706 212 894 238"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="surface-fragment-pool__pieces">
        {fragments.map((fragment) => (
          <motion.span
            key={fragment.id}
            initial={{ opacity: 0, scale: 0.2, rotate: fragment.rotate - 80 }}
            whileInView={{ opacity: 1, scale: 1, rotate: fragment.rotate }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ delay: fragment.delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              left: fragment.left,
              top: fragment.top,
              width: `${fragment.size}rem`,
              height: `${fragment.size * 2.8}rem`,
            }}
          />
        ))}
      </div>
      <div className="surface-fragment-pool__labels">
        <span>alpha path</span>
        <span>beta path</span>
        <span>gamma path</span>
      </div>
    </motion.div>
  );
}

function SignatureHits() {
  const { latestRun } = useAnalysisStore();
  const labels = latestRun.summary.detectedLabels.length ? latestRun.summary.detectedLabels : [latestRun.summary.topPrediction];

  return (
    <div className="signature-hits">
      {labels.slice(0, 5).map((label, index) => (
        <div key={`${label}-${index}`}>
          <span>{label}</span>
          <strong className={index < 2 ? "risk-high" : index === 2 ? "risk-medium" : "risk-low"}>
            {index < 2 ? "high" : index === 2 ? "med" : "low"}
          </strong>
        </div>
      ))}
    </div>
  );
}

function UnderworldMap() {
  const nodes = [
    ["TLS", "18%", "32%"],
    ["HTTP", "48%", "20%"],
    ["SNMP", "22%", "68%"],
    ["CUSTOM 8833", "58%", "58%"],
    ["SBOX", "80%", "40%"],
  ];

  return (
    <div className="underworld-map">
      <div className="underworld-map__core">CUSTOM<br />8833</div>
      {nodes.map(([label, left, top]) => (
        <span key={label} style={{ left, top }}>
          {label}
        </span>
      ))}
    </div>
  );
}

function LiveAnalysisRig() {
  const stages = [
    { label: "hash", value: "sha256", tone: "green" },
    { label: "entropy", value: "7.94", tone: "amber" },
    { label: "signature", value: "18", tone: "cyan" },
    { label: "risk", value: "critical", tone: "red" },
  ];

  return (
    <motion.div
      className="live-analysis-rig"
      initial={{ opacity: 0, y: 38 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.35 }}
      transition={{ duration: 0.76, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="reactor-core">
        <span className="reactor-core__ring is-a" />
        <span className="reactor-core__ring is-b" />
        <span className="reactor-core__ring is-c" />
        <strong>BB</strong>
      </div>
      <div className="reactor-lanes">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.label}
            className={`reactor-lane is-${stage.tone}`}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ delay: index * 0.08, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>{stage.label}</span>
            <strong>{stage.value}</strong>
            <i />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ReportMonitor() {
  const { latestRun } = useAnalysisStore();

  return (
    <div className="report-monitor">
      <div className="report-monitor__bar">
        <span>BlackBoxAI report</span>
        <code>run {latestRun.runId.slice(0, 8)}</code>
      </div>
      <div className="report-monitor__body">
        <p>verdict</p>
        <h3>{latestRun.summary.riskLevel}</h3>
        <span>{latestRun.summary.topPrediction} detected</span>
        <div className="report-monitor__stats">
          <b>42<small>evidence</small></b>
          <b>{latestRun.summary.detectedLabels.length || 1}<small>signatures</small></b>
          <b>{latestRun.summary.riskScore}<small>risk</small></b>
        </div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { latestRun, displayRuns, usingDemoData } = useAnalysisStore();

  return (
    <div className="cinema-page protocol-underworld-page">
      <ShardGuide />
      <ProtocolMotionField />

      <section className="underworld-hero">
        <img className="underworld-bg" src="/cyber/protocol-underworld.png" alt="" />
        <div className="underworld-vignette" />

        <motion.div
          className="underworld-copy"
          initial={{ opacity: 0, y: 42 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="noir-eyebrow">crypto firmware lab</p>
          <h1>Firmware enters. Secrets leave.</h1>
          <ul className="hero-truths">
            <li>Trace the primitive.</li>
            <li>Evidence, not vibes.</li>
            <li>Weak crypto has nowhere to hide.</li>
          </ul>
          <div className="underworld-actions">
            <Button asChild className="noir-primary">
              <Link to="/upload">
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload firmware
              </Link>
            </Button>
            <Button asChild variant="outline" className="noir-secondary">
              <Link to="/upload">
                <Database className="mr-2 h-4 w-4" />
                Analyze CSV
              </Link>
            </Button>
          </div>
          <Link className="inspect-link" to="/results">
            Inspect evidence
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          className="artifact-core"
          initial={{ opacity: 0, scale: 0.85, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.32, duration: 0.86, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        >
          <span />
        </motion.div>

        <div className="underworld-side-panels">
          <SuspiciousSamplePanel />
          <TelemetryPanel />
        </div>

        <ProofStrip />
      </section>

      <section className="protocol-surface">
        <div className="surface-intro">
          <p className="noir-eyebrow">below the surface</p>
          <h2>Protocol underworld.</h2>
          <p>One sample. Five steps. Complete visibility.</p>
        </div>
        <FragmentPoolStage />
        <AnalysisCorridor />
        <LiveAnalysisRig />
        <div className="surface-grid">
          <div className="world-card opcode-card">
            <Binary className="h-6 w-6 text-cyan-100" />
            <p className="telemetry-label">opcode stream</p>
            <code>0x80001000 3C6F0D LUI $sp, 0xF00</code>
            <code>0x80001004 279C1234 ADDIU $gp, $gp, 0x1234</code>
            <code>0x80001008 8F820000 LW $v0, 0($gp)</code>
            <Link to="/results">View full disasm <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="world-card entropy-card">
            <Gauge className="h-6 w-6 text-amber-100" />
            <p className="telemetry-label">entropy map</p>
            <div className="entropy-bars" aria-hidden="true">
              {Array.from({ length: 24 }, (_, index) => (
                <span key={index} style={{ height: `${24 + ((index * 19) % 68)}%` }} />
              ))}
            </div>
            <small>low to high entropy lanes</small>
          </div>
          <div className="world-card signatures-card">
            <FileSearch className="h-6 w-6 text-red-100" />
            <p className="telemetry-label">signature hits</p>
            <SignatureHits />
          </div>
          <div className="world-card map-card">
            <RadioTower className="h-6 w-6 text-emerald-100" />
            <p className="telemetry-label">protocol graph</p>
            <UnderworldMap />
            <Link to="/protocol">Explore map <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="world-card report-card">
            <ReportMonitor />
          </div>
        </div>
      </section>

      <section className="journey-section">
        <div className="journey-sticky">
          <p className="noir-eyebrow">{usingDemoData ? "sample memory" : "live run memory"}</p>
          <h2>The shard keeps moving.</h2>
          <p>{latestRun.input.filename}</p>
          <div className="journey-metrics">
            <span>{latestRun.summary.topPrediction}</span>
            <span>{latestRun.summary.riskScore} risk</span>
            <span>{displayRuns.length} runs</span>
          </div>
        </div>
        <div className="chapter-stack chapter-stack--underworld">
          {journeyChapters.map((chapter, index) => (
            <ScrollChapter
              key={chapter.eyebrow}
              eyebrow={chapter.eyebrow}
              title={chapter.title}
              copy={chapter.copy}
              accent={chapter.accent}
              align={index % 2 === 0 ? "left" : "right"}
            >
              <div className="chapter-proof">
                <GitBranch className="h-5 w-5" />
                <span>{proofModules[index].title}</span>
                <small>{proofModules[index].detail}</small>
              </div>
            </ScrollChapter>
          ))}
        </div>
      </section>

      <section className="final-monitor final-monitor--underworld">
        <div className="final-monitor__frame">
          <div className="final-monitor__screen">
            <p className="noir-eyebrow">the whole picture</p>
            <h2 className="final-monitor__title" data-text="Fragments reassemble. Truth remains.">
              Fragments reassemble. Truth remains.
            </h2>
            <div className="final-monitor__stats">
              <span>{latestRun.summary.topPrediction}</span>
              <span>{latestRun.summary.riskLevel}</span>
              <span>{latestRun.modelType}</span>
            </div>
            <div className="hero-actions">
              <Button asChild className="noir-primary">
                <Link to="/upload">Run the next binary</Link>
              </Button>
              <Button asChild variant="outline" className="noir-secondary">
                <Link to="/api">
                  <Braces className="mr-2 h-4 w-4" />
                  API contract
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
