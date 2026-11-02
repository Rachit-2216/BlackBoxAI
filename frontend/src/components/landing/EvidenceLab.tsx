import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  FileCode2,
  Fingerprint,
  Play,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

const samples = [
  {
    name: "router_firmware.bin",
    device: "Router firmware",
    size: "2.34 MB",
    architecture: "ARM / little-endian",
    hash: "9f3c7a91e254b680",
    entropy: "7.94",
    primitives: [
      {
        name: "AES-128",
        confidence: 97,
        type: "Block cipher",
        tone: "neutral",
      },
      {
        name: "SHA-256",
        confidence: 94,
        type: "Hash function",
        tone: "neutral",
      },
      { name: "RC4", confidence: 88, type: "Legacy cipher", tone: "danger" },
    ],
    finding: "Legacy stream cipher detected",
    recommendation:
      "Review the RC4 implementation and replace it with authenticated encryption.",
    risk: "HIGH",
    offset: "0x00003A80",
  },
  {
    name: "sensor_bootloader.bin",
    device: "IoT bootloader",
    size: "512 KB",
    architecture: "ARM Cortex-M",
    hash: "4b12d9e073a6c852",
    entropy: "6.82",
    primitives: [
      {
        name: "AES-256",
        confidence: 96,
        type: "Block cipher",
        tone: "neutral",
      },
      {
        name: "SHA-256",
        confidence: 92,
        type: "Hash function",
        tone: "neutral",
      },
      { name: "ECC", confidence: 85, type: "Public key", tone: "neutral" },
    ],
    finding: "Review key storage",
    recommendation:
      "Confirm signing keys are stored outside the firmware image and validate the secure boot chain.",
    risk: "REVIEW",
    offset: "0x00001820",
  },
  {
    name: "gateway_update.bin",
    device: "Network gateway",
    size: "4.08 MB",
    architecture: "MIPS / big-endian",
    hash: "7e903cd15f26a8b4",
    entropy: "7.61",
    primitives: [
      { name: "DES", confidence: 95, type: "Legacy cipher", tone: "danger" },
      { name: "MD5", confidence: 91, type: "Legacy hash", tone: "danger" },
      { name: "RSA", confidence: 87, type: "Public key", tone: "neutral" },
    ],
    finding: "Deprecated cryptography detected",
    recommendation:
      "Migrate DES to a modern authenticated cipher and replace MD5 for integrity verification.",
    risk: "HIGH",
    offset: "0x00007C40",
  },
];
const tabs = ["Overview", "Primitives", "Findings"];

export default function EvidenceLab() {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [tab, setTab] = useState("Overview");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const reduced = useReducedMotion();
  const sample = samples[sampleIndex];
  useEffect(() => () => clearInterval(timer.current), []);
  function scan() {
    clearInterval(timer.current);
    setScanning(true);
    setProgress(0);
    let next = 0;
    timer.current = setInterval(() => {
      next = Math.min(next + 8, 100);
      setProgress(next);
      if (next === 100) {
        clearInterval(timer.current);
        setScanning(false);
      }
    }, 85);
  }
  function download() {
    const data = {
      demo: true,
      source: "BlackBoxAI illustrative sample",
      sample,
      generatedAt: new Date().toISOString(),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sample.name}.demo-report.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="lab-workbench">
      <div className="lab-toolbar">
        <span>
          <i className="status-dot" /> BLACKBOX / SANDBOX
        </span>
        <span className="demo-tag">ILLUSTRATIVE DATA</span>
      </div>
      <div className="lab-body">
        <aside className="lab-samples">
          <span className="mono-label">
            SAMPLE LIBRARY <span>03</span>
          </span>
          {samples.map((item, index) => (
            <button
              key={item.name}
              className={
                sampleIndex === index ? "sample-option active" : "sample-option"
              }
              onClick={() => {
                clearInterval(timer.current);
                setScanning(false);
                setProgress(0);
                setSampleIndex(index);
              }}
              aria-pressed={sampleIndex === index}
            >
              <FileCode2 size={18} />
              <span>
                <strong>{item.device}</strong>
                <small>{item.name}</small>
              </span>
              <ArrowUpRight size={15} />
            </button>
          ))}
          <div className="lab-note">
            <Fingerprint size={22} />
            <p>
              A closer look.
              <br />
              Without touching your files.
            </p>
            <span>
              Curated samples. Local interaction.
              <br />
              No upload. No external API.
            </span>
          </div>
        </aside>
        <div className="lab-evidence">
          <div className="evidence-heading">
            <div>
              <span className="mono-label">{sample.architecture}</span>
              <h3>{sample.name}</h3>
            </div>
            <button className="scan-button" onClick={scan} disabled={scanning}>
              {scanning ? (
                <RotateCcw className="spin" size={14} />
              ) : (
                <Play size={14} />
              )}
              {scanning ? "Inspecting" : "Replay scan"}
            </button>
          </div>
          <div className="lab-tabs" role="tablist" aria-label="Sample evidence">
            {tabs.map((item) => (
              <button
                id={`tab-${item}`}
                key={item}
                role="tab"
                aria-selected={tab === item}
                aria-controls="evidence-panel"
                tabIndex={tab === item ? 0 : -1}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    const next =
                      tabs[
                        (tabs.indexOf(tab) +
                          (event.key === "ArrowRight" ? 1 : 2)) %
                          3
                      ];
                    setTab(next);
                    document.getElementById(`tab-${next}`)?.focus();
                  }
                }}
                onClick={() => setTab(item)}
              >
                {item}
                {item === "Findings" && <span>1</span>}
              </button>
            ))}
            <span className="evidence-size">{sample.size}</span>
          </div>
          {scanning && (
            <div className="scan-progress" role="status">
              <span style={{ width: `${progress}%` }} />
              <p>Inspecting sample evidence... {progress}%</p>
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${sampleIndex}-${tab}`}
              role="tabpanel"
              id="evidence-panel"
              aria-labelledby={`tab-${tab}`}
              className="evidence-panel"
              initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: reduced ? 1 : 0 }}
              transition={{ duration: 0.18 }}
            >
              {tab === "Overview" ? (
                <>
                  <div className="evidence-stats">
                    <div>
                      <span>PRIMITIVES</span>
                      <strong>03</strong>
                    </div>
                    <div>
                      <span>ENTROPY / 8</span>
                      <strong>{sample.entropy}</strong>
                    </div>
                    <div>
                      <span>REVIEW STATUS</span>
                      <strong
                        className={
                          sample.risk === "HIGH" ? "text-danger" : "text-yellow"
                        }
                      >
                        {sample.risk}
                      </strong>
                    </div>
                  </div>
                  <div className="byte-heading">
                    <span className="mono-label">BYTE DISTRIBUTION</span>
                    <span>256 BINS</span>
                  </div>
                  <div
                    className="byte-spectrum"
                    aria-label="Illustrative byte frequency distribution"
                  >
                    {Array.from({ length: 80 }, (_, i) => (
                      <i
                        key={i}
                        style={{
                          height: `${15 + ((i * 31 + sampleIndex * 19 + Math.floor(i / 7) * 23) % 82)}%`,
                          background: i > 47 && i < 59 ? "#e3ff73" : undefined,
                        }}
                      />
                    ))}
                  </div>
                  <div className="hash-line">
                    <Fingerprint size={14} />
                    <span>SHA256</span>
                    <code>{sample.hash}...c83e</code>
                    <Check size={14} />
                  </div>
                </>
              ) : tab === "Primitives" ? (
                <div className="primitive-list">
                  <div className="primitive-table-head">
                    <span>PRIMITIVE / TYPE</span>
                    <span>MODEL CONFIDENCE</span>
                  </div>
                  {sample.primitives.map((item) => (
                    <div key={item.name} className="primitive-row">
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.type}</small>
                      </div>
                      <div>
                        <span>{item.confidence}%</span>
                        <div className="confidence-track">
                          <i
                            style={{
                              width: `${item.confidence}%`,
                              background:
                                item.tone === "danger" ? "#ff8c7c" : "#e3ff73",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="finding-detail">
                  <ShieldAlert size={28} />
                  <div>
                    <span className="finding-severity">{sample.risk} / 01</span>
                    <h4>{sample.finding}</h4>
                    <code>{sample.offset} / .text</code>
                    <p>{sample.recommendation}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="evidence-footer">
            <span>
              <Check size={13} />{" "}
              {scanning ? "Scan in progress" : "Sample evidence loaded"}
            </span>
            <button onClick={download}>
              Export JSON <ArrowDownToLine size={14} />
            </button>
          </div>
        </div>
      </div>
      <div className="lab-bottom">
        <span>DEMO ENVIRONMENT</span>
        <span>Model scores are illustrative, not a security verdict.</span>
      </div>
    </div>
  );
}
