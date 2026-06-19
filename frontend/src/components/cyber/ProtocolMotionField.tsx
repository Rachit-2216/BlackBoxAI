import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

const rain = ["AES", "SHA256", "SBOX", "0x8F82", "RSA", "NVRAM", "ECC", "XOR", "0xC0DE", "HMAC", "ASN1", "KEY"];

const tiles = Array.from({ length: 42 }, (_, index) => ({
  id: `tile-${index}`,
  left: `${4 + ((index * 17) % 91)}%`,
  top: `${10 + ((index * 23) % 82)}%`,
  delay: `${(index % 9) * 0.21}s`,
  size: `${18 + (index % 5) * 9}px`,
}));

const heatCells = Array.from({ length: 72 }, (_, index) => ({
  id: `heat-${index}`,
  left: `${2 + (index % 12) * 8}%`,
  top: `${18 + Math.floor(index / 12) * 10}%`,
  delay: `${(index % 11) * 0.12}s`,
  hot: index % 13 === 0 || index % 17 === 0,
}));

const packetLanes = Array.from({ length: 9 }, (_, index) => ({
  id: `packet-${index}`,
  top: `${16 + index * 8}%`,
  delay: `${index * -0.46}s`,
  duration: `${4.6 + (index % 4) * 0.45}s`,
  width: `${28 + (index % 3) * 8}vw`,
}));

const reticles = [
  { id: "reticle-a", left: "47%", top: "33%", size: "9rem" },
  { id: "reticle-b", left: "72%", top: "58%", size: "6.4rem" },
  { id: "reticle-c", left: "28%", top: "71%", size: "7.2rem" },
];

const nodes = [
  { label: "INGEST", left: "21%", top: "62%" },
  { label: "DISASM", left: "38%", top: "71%" },
  { label: "DETECT", left: "55%", top: "58%" },
  { label: "MAP", left: "72%", top: "66%" },
  { label: "REPORT", left: "84%", top: "78%" },
];

export function ProtocolMotionField() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 82, damping: 24, mass: 0.32 });

  const scanY = useTransform(smoothProgress, [0, 1], ["-12vh", reduceMotion ? "-12vh" : "102vh"]);
  const ribbonX = useTransform(smoothProgress, [0, 0.5, 1], ["-7vw", reduceMotion ? "-7vw" : "4vw", reduceMotion ? "-7vw" : "-3vw"]);
  const orbitRotate = useTransform(smoothProgress, [0, 1], [0, reduceMotion ? 0 : 144]);
  const orbitScale = useTransform(smoothProgress, [0, 0.38, 1], [0.86, 1.08, 0.94]);
  const tileY = useTransform(smoothProgress, [0, 1], ["0vh", reduceMotion ? "0vh" : "-34vh"]);
  const railDraw = useTransform(smoothProgress, [0.04, 0.48], [0.05, 1]);
  const lateDraw = useTransform(smoothProgress, [0.32, 0.82], [0, 1]);
  const packetTilt = useTransform(smoothProgress, [0, 1], [-5, reduceMotion ? -5 : 8]);
  const heatOpacity = useTransform(smoothProgress, [0, 0.22, 0.72, 1], [0.12, reduceMotion ? 0.12 : 0.72, 0.44, 0.18]);
  const reticleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.9, reduceMotion ? 0.9 : 1.12, 0.98]);
  const terminalY = useTransform(smoothProgress, [0, 1], ["0vh", reduceMotion ? "0vh" : "20vh"]);
  const fieldOpacity = useTransform(smoothProgress, [0, 0.1, 0.18, 0.82, 1], [0, 0, 0.9, 0.68, 0.22]);

  return (
    <motion.div className="protocol-motion-field" style={{ opacity: fieldOpacity }} aria-hidden="true">
      <motion.div className="motion-scan-beam" style={{ y: scanY }} />

      <motion.div className="packet-lane-field" style={{ rotate: packetTilt }}>
        {packetLanes.map((lane) => (
          <span
            key={lane.id}
            style={{
              top: lane.top,
              width: lane.width,
              animationDelay: lane.delay,
              animationDuration: lane.duration,
            }}
          >
            <i />
          </span>
        ))}
      </motion.div>

      <motion.div className="heatmap-sweep-field" style={{ opacity: heatOpacity }}>
        {heatCells.map((cell) => (
          <span
            key={cell.id}
            className={cell.hot ? "is-hot" : undefined}
            style={{
              left: cell.left,
              top: cell.top,
              animationDelay: cell.delay,
            }}
          />
        ))}
      </motion.div>

      <motion.div className="memory-tile-field" style={{ y: tileY }}>
        {tiles.map((tile) => (
          <span
            key={tile.id}
            style={{
              left: tile.left,
              top: tile.top,
              width: tile.size,
              height: tile.size,
              animationDelay: tile.delay,
            }}
          />
        ))}
      </motion.div>

      <motion.div className="protocol-orbit" style={{ rotate: orbitRotate, scale: orbitScale }}>
        <span className="protocol-orbit__ring is-outer" />
        <span className="protocol-orbit__ring is-inner" />
        <span className="protocol-orbit__node is-a" />
        <span className="protocol-orbit__node is-b" />
        <span className="protocol-orbit__node is-c" />
      </motion.div>

      <motion.svg className="signal-ribbon-field" viewBox="0 0 1440 1024" preserveAspectRatio="none" style={{ x: ribbonX }}>
        <defs>
          <linearGradient id="underworld-ribbon-green" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#74ff9c" stopOpacity="0" />
            <stop offset="48%" stopColor="#74ff9c" stopOpacity="0.68" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="underworld-ribbon-red" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#e5484d" stopOpacity="0" />
            <stop offset="56%" stopColor="#e5484d" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="underworld-ribbon-amber" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0" />
            <stop offset="52%" stopColor="#facc15" stopOpacity="0.54" />
            <stop offset="100%" stopColor="#74ff9c" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 130 720 C 390 570 502 810 712 642 C 912 482 1042 662 1325 492"
          fill="none"
          stroke="url(#underworld-ribbon-green)"
          strokeWidth="2.2"
          strokeDasharray="10 18"
          style={{ pathLength: railDraw }}
        />
        <motion.path
          d="M 270 892 C 492 766 656 916 830 760 C 1000 608 1124 778 1390 676"
          fill="none"
          stroke="url(#underworld-ribbon-red)"
          strokeWidth="1.5"
          strokeDasharray="4 16"
          style={{ pathLength: railDraw }}
        />
        <motion.path
          className="analysis-circuit-path"
          d="M 72 244 L 262 244 L 316 306 L 516 306 L 580 250 L 784 250 L 846 310 L 1180 310 L 1334 190"
          fill="none"
          stroke="url(#underworld-ribbon-amber)"
          strokeWidth="1.8"
          strokeDasharray="2 12"
          style={{ pathLength: lateDraw }}
        />
        <motion.path
          className="analysis-circuit-path"
          d="M 88 412 L 232 412 L 292 486 L 456 486 L 520 438 L 696 438 L 756 520 L 1040 520 L 1126 452 L 1360 452"
          fill="none"
          stroke="url(#underworld-ribbon-green)"
          strokeWidth="1.4"
          strokeDasharray="8 10"
          style={{ pathLength: lateDraw }}
        />
      </motion.svg>

      <motion.div className="breach-reticle-field" style={{ scale: reticleScale }}>
        {reticles.map((reticle) => (
          <span
            key={reticle.id}
            style={{
              left: reticle.left,
              top: reticle.top,
              width: reticle.size,
              height: reticle.size,
            }}
          />
        ))}
      </motion.div>

      <motion.div className="terminal-ghost-field" style={{ y: terminalY }}>
        <code>sha256: 9f3c...7a91</code>
        <code>entropy window: 7.94</code>
        <code>primitive hit: AES/SBOX</code>
        <code>protocol edge: custom:8833</code>
      </motion.div>

      <div className="data-rain">
        {rain.map((item, index) => (
          <span
            key={`${item}-${index}`}
            style={{
              left: `${8 + ((index * 9) % 84)}%`,
              animationDelay: `${index * 0.31}s`,
              animationDuration: `${5.4 + (index % 4) * 0.65}s`,
            }}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="scroll-node-rail">
        {nodes.map((node) => (
          <span key={node.label} style={{ left: node.left, top: node.top }}>
            {node.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default ProtocolMotionField;
