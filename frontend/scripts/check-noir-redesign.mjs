import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

const packageJson = JSON.parse(read("package.json"));
for (const dependency of ["motion", "three", "@react-three/fiber", "@react-three/drei"]) {
  assert(packageJson.dependencies?.[dependency], `Missing dependency: ${dependency}`);
}

const requiredFiles = [
  "src/components/cyber/CyberSceneCanvas.tsx",
  "src/components/cyber/ProtocolMotionField.tsx",
  "src/components/cyber/ShardGuide.tsx",
  "src/components/cyber/ScrollChapter.tsx",
  "src/components/layout/FloatingCommandNav.tsx",
  "src/components/layout/NoirToolShell.tsx",
];

for (const file of requiredFiles) {
  assert(exists(file), `Missing required noir redesign file: ${file}`);
}

const scene = read("src/components/cyber/CyberSceneCanvas.tsx");
assert(scene.includes("<Canvas"), "CyberSceneCanvas must use @react-three/fiber Canvas");
assert(scene.includes("instancedMesh"), "CyberSceneCanvas must use instancedMesh fragments");
assert(scene.includes("MonitorCore"), "CyberSceneCanvas must include MonitorCore");
assert(scene.includes("FragmentField"), "CyberSceneCanvas must include FragmentField");

const dashboard = read("src/pages/Dashboard.tsx");
for (const phrase of [
  "Firmware enters. Secrets leave.",
  "Protocol underworld.",
  "Trace the primitive.",
  "Evidence, not vibes.",
  "Weak crypto has nowhere to hide.",
]) {
  assert(dashboard.includes(phrase), `Dashboard missing selected Protocol Underworld copy: ${phrase}`);
}
for (const gate of ["INGEST", "DISASSEMBLE", "DETECT", "MAP", "REPORT"]) {
  assert(dashboard.includes(gate), `Dashboard missing scroll gate: ${gate}`);
}
for (const proof of ["Upload firmware", "Analyze CSV", "Inspect evidence", "Explore map", "View full report"]) {
  assert(dashboard.includes(proof), `Dashboard missing product proof module: ${proof}`);
}
assert(dashboard.includes("ShardGuide"), "Dashboard must include the persistent shard guide");
assert(dashboard.includes("ProtocolMotionField"), "Dashboard must include the scroll-linked protocol motion field");
assert(dashboard.includes("FragmentPoolStage"), "Dashboard must include the second-section fragment pool");
assert(dashboard.includes("LiveAnalysisRig"), "Dashboard must include the live analysis reactor graphic");
assert(dashboard.includes("ScrollChapter"), "Dashboard must use scroll chapters");
assert(dashboard.includes("final-monitor__title"), "Dashboard must include the final monitor hover title");
assert(dashboard.includes("/cyber/protocol-underworld.png"), "Dashboard must use the selected Protocol Underworld visual asset");

const shardGuide = read("src/components/cyber/ShardGuide.tsx");
for (const guideFeature of ["fragment-pool-fixed", "shard-flight", "guide-path-web", "is-alpha", "is-beta", "is-gamma"]) {
  assert(shardGuide.includes(guideFeature), `ShardGuide missing three-path fragment feature: ${guideFeature}`);
}

const motionField = read("src/components/cyber/ProtocolMotionField.tsx");
for (const motionFeature of [
  "motion-scan-beam",
  "packet-lane-field",
  "heatmap-sweep-field",
  "memory-tile-field",
  "protocol-orbit",
  "signal-ribbon-field",
  "analysis-circuit-path",
  "breach-reticle-field",
  "terminal-ghost-field",
  "data-rain",
  "scroll-node-rail",
]) {
  assert(motionField.includes(motionFeature), `ProtocolMotionField missing motion feature: ${motionFeature}`);
}

const app = read("src/App.tsx");
assert(app.includes("FloatingCommandNav"), "App must use FloatingCommandNav");
assert(!app.includes("<Sidebar"), "Dashboard shell must remove the dominant fixed Sidebar");

const upload = read("src/pages/Upload.tsx");
assert(upload.includes("NoirToolShell"), "Upload must use NoirToolShell");
assert(upload.includes("firmware-ingest"), "Upload must use the firmware ingest workbench concept");

const css = read("src/index.css");
for (const className of [
  ".underworld-hero",
  ".artifact-core",
  ".underworld-map",
  ".scroll-gate-card",
  ".proof-strip",
  ".protocol-motion-field",
  ".motion-scan-beam",
  ".packet-lane-field",
  ".heatmap-sweep-field",
  ".fragment-pool-fixed",
  ".shard-flight",
  ".guide-path-web",
  ".surface-fragment-pool",
  ".analysis-corridor",
  ".analysis-node",
  ".final-monitor__title",
  ".signal-ribbon-field",
  ".live-analysis-rig",
  ".reactor-core",
]) {
  assert(css.includes(className), `Missing selected Protocol Underworld CSS class: ${className}`);
}

console.log("Protocol Underworld UI contract satisfied.");
