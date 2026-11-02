import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { DecodeText } from "./MotionType";

const phases = [
  {
    title: "BINARY",
    subtitle: "A million instructions. A hidden language.",
    code: "RAW BYTE SPACE",
    detail: "00 4F 8A 1C 00 FF 37 B2",
    number: "01",
  },
  {
    title: "PATTERN",
    subtitle: "The repetition starts to mean something.",
    code: "SIGNATURE SPACE",
    detail: "SBOX / ROUND / ROTATE / XOR",
    number: "02",
  },
  {
    title: "EVIDENCE",
    subtitle: "Now you know where to look.",
    code: "INVESTIGATION SPACE",
    detail: "OFFSET / PRIMITIVE / CONFIDENCE",
    number: "03",
  },
];

function DataSlab({
  index,
  progress,
  reduced,
}: {
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const x = useTransform(
    progress,
    [0, 0.5, 1],
    [(index - 5.5) * 32, (index - 5.5) * 45, (index - 5.5) * 27],
  );
  const y = useTransform(
    progress,
    [0, 0.5, 1],
    [
      Math.sin(index * 3) * 90,
      (index % 2 ? -1 : 1) * 145,
      Math.cos(index) * 35,
    ],
  );
  const rotate = useTransform(
    progress,
    [0, 0.5, 1],
    [index * 13 - 60, index * 24, index * 90],
  );
  const rotateX = useTransform(progress, [0, 1], [55, -35]);
  const opacity = useTransform(
    progress,
    [0, 0.2, 0.8, 1],
    [0.25, 0.8, 0.65, 0.2],
  );
  return (
    <motion.i
      className="signal-slab"
      style={
        reduced
          ? {
              x: (index - 5.5) * 30,
              y: index % 2 ? -110 : 110,
              rotate: index * 12,
              opacity: 0.35,
            }
          : { x, y, rotate, rotateX, opacity }
      }
    >
      <span>{(index * 1387 + 427).toString(16).toUpperCase()}</span>
      <b />
      <b />
      <b />
    </motion.i>
  );
}

export default function SignalPassage() {
  const section = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  const [phase, setPhase] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (value) =>
    setPhase(Math.min(2, Math.floor(value * 3))),
  );
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scanX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const current = phases[phase];
  return (
    <section
      className="signal-passage"
      ref={section}
      aria-labelledby="signal-heading"
    >
      <div className="signal-sticky">
        <div className="signal-top">
          <span className="mono-label">BETWEEN INPUT AND INSIGHT</span>
          <span className="mono-label">
            {current.number} / 03 <ArrowDownRight size={16} />
          </span>
        </div>
        <div className="signal-visual" aria-hidden="true">
          <div className="signal-ruler">
            {Array.from({ length: 31 }, (_, i) => (
              <i key={i} />
            ))}
            <motion.b style={{ left: scanX }} />
          </div>
          <div className="signal-slabs">
            {Array.from({ length: 12 }, (_, i) => (
              <DataSlab
                key={i}
                index={i}
                progress={scrollYProgress}
                reduced={reduced}
              />
            ))}
          </div>
          <div className="signal-thread thread-one" />
          <div className="signal-thread thread-two" />
        </div>
        <div className="signal-type">
          <h2 id="signal-heading">
            <span className="sr-only">From binary to pattern to evidence.</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={current.title}
                aria-hidden="true"
                initial={{
                  opacity: 0,
                  y: reduced ? 0 : 25,
                  filter: reduced ? "none" : "blur(8px)",
                }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  y: reduced ? 0 : -25,
                  filter: reduced ? "none" : "blur(8px)",
                }}
                transition={{ duration: 0.3 }}
              >
                <DecodeText text={current.title} />
              </motion.span>
            </AnimatePresence>
          </h2>
          <p>{current.subtitle}</p>
          <span className="signal-code">{current.detail}</span>
        </div>
        <div className="signal-bottom">
          <div className="signal-stages">
            {phases.map((item, i) => (
              <span key={item.title} className={phase === i ? "is-active" : ""}>
                <b>{item.number}</b>
                {item.code}
              </span>
            ))}
          </div>
          <motion.div
            className="signal-progress"
            style={{ scaleX: reduced ? 1 : lineScale }}
          />
          <a href="#lab">
            Follow it into the lab <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
