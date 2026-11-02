import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  ChevronRight,
  Code2,
  Cpu,
  Fingerprint,
  Github,
  Menu,
  Minus,
  Plus,
  ScanLine,
  ShieldCheck,
  X,
} from "lucide-react";
import EvidenceLab from "@/components/landing/EvidenceLab";

const FirmwareCore = lazy(() => import("@/components/landing/FirmwareCore"));
const repository = "https://github.com/Rachit-2216/BlackBoxAI";
const stages = [
  {
    label: "DECONSTRUCT",
    title: "Start with the unknown.",
    copy: "A compiled binary holds more than instructions. Surface the byte patterns, entropy, and structure hiding inside it.",
    icon: Box,
    code: [
      "$ blackbox inspect router_firmware.bin",
      "[01] reading binary structure",
      "[02] extracting opcode features",
      "[03] computing entropy windows",
      "[ok] sample ready for analysis",
    ],
  },
  {
    label: "RECOGNIZE",
    title: "Give the patterns a name.",
    copy: "Combine recognizable signatures with model predictions to explore standard cryptographic primitives and proprietary patterns.",
    icon: Fingerprint,
    code: [
      "$ blackbox detect --model standard",
      "[hit] AES substitution pattern",
      "[hit] SHA-256 constants",
      "[hit] RC4 key-scheduling pattern",
      "[ok] 3 primitive candidates",
    ],
  },
  {
    label: "INVESTIGATE",
    title: "Follow the evidence.",
    copy: "Put predictions in context. Inspect confidence, locate suspicious patterns, and turn a finding into a question worth investigating.",
    icon: ScanLine,
    code: [
      "$ blackbox report --format json",
      "[ref] .text + 0x00003A80",
      "[flag] legacy stream cipher",
      "[next] review implementation",
      "[ok] evidence report assembled",
    ],
  },
];
const questions = [
  [
    "What is BlackBoxAI?",
    "BlackBoxAI is an open-source research project for identifying cryptographic patterns in firmware. It combines binary feature extraction, signature analysis, and machine learning with standard and proprietary model workflows.",
  ],
  [
    "Is the interactive lab running a real model?",
    "No. This landing page is entirely frontend-only. The lab uses three curated, illustrative samples so you can explore the intended output without a server. Replaying a scan animates that sample; it does not perform inference.",
  ],
  [
    "Can I analyze my own firmware?",
    "The repository includes a Python API and model pipelines for binary and CSV workflows. Follow the repository setup instructions to run the analysis environment locally. This public landing page does not upload or analyze your files.",
  ],
  [
    "Does a detection mean the firmware is insecure?",
    "No. A primitive or a model score is a lead, not a verdict. Security depends on implementation, key management, protocol design, and context. Findings require independent investigation.",
  ],
];

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Pipeline() {
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActive(Number((entry.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: "-25% 0px -40% 0px", threshold: 0 },
    );
    steps.current.forEach((step) => {
      if (step) observer.observe(step);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <section
      className="pipeline section-pad"
      id="process"
      aria-labelledby="process-heading"
    >
      <div className="section-kicker">
        <span>01 / THE PROCESS</span>
        <span>FROM OPAQUE TO OBSERVABLE</span>
      </div>
      <Reveal className="section-intro">
        <h2 id="process-heading">
          A black box.
          <br />
          An open investigation.
        </h2>
        <p>
          Take firmware apart.
          <br />
          Put the picture together.
        </p>
      </Reveal>
      <div className="pipeline-layout">
        <div className="pipeline-steps">
          {stages.map((stage, index) => (
            <article
              key={stage.label}
              data-step={index}
              ref={(el) => {
                steps.current[index] = el;
              }}
              className={
                active === index ? "pipeline-step is-active" : "pipeline-step"
              }
            >
              <span className="step-index">0{index + 1}</span>
              <div>
                <span className="mono-label">{stage.label}</span>
                <h3>{stage.title}</h3>
                <p>{stage.copy}</p>
                <button className="text-link" onClick={() => setActive(index)}>
                  Inspect this stage <ArrowUpRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="pipeline-visual">
          <div className="pipeline-visual-head">
            <span>
              <i className="status-dot" /> ANALYSIS SEQUENCE
            </span>
            <span>0{active + 1} / 03</span>
          </div>
          <div
            className={`exploded-diagram phase-${active}`}
            aria-hidden="true"
          >
            <div className="diagram-cross cross-a" />
            <div className="diagram-cross cross-b" />
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className="diagram-layer"
                style={{ "--layer": i } as React.CSSProperties}
              >
                <span>
                  {i === 3
                    ? "BB / CORE"
                    : `0${i} / ${["BINARY", "OPCODES", "ENTROPY", "CORE", "SIGNATURES", "INFERENCE", "EVIDENCE"][i]}`}
                </span>
                <i />
                <i />
                <i />
              </div>
            ))}
            <span className="diagram-axis">FEATURE SPACE / EXPLODED VIEW</span>
          </div>
          <div
            className="sequence-tabs"
            role="group"
            aria-label="Analysis stage"
          >
            {stages.map((stage, i) => (
              <button
                key={stage.label}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
              >
                <stage.icon size={15} />0{i + 1}
                <span>{stage.label}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="pipeline-terminal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {stages[active].code.map((line, i) => (
                <p key={line}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <code>{line}</code>
                </p>
              ))}
            </motion.div>
          </AnimatePresence>
          <span className="terminal-caption">
            ILLUSTRATIVE PIPELINE / NOT A CLI COMMAND REFERENCE
          </span>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="faq section-pad" id="about">
      <div>
        <span className="mono-label">04 / FIELD NOTES</span>
        <h2>
          A few things
          <br />
          worth knowing.
        </h2>
        <a
          className="text-link"
          href={`${repository}#readme`}
          target="_blank"
          rel="noreferrer"
        >
          Read the project docs <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="faq-list">
        {questions.map(([question, answer], i) => (
          <article
            key={question}
            className={open === i ? "faq-item is-open" : "faq-item"}
          >
            <h3>
              <button
                aria-expanded={open === i}
                aria-controls={`answer-${i}`}
                id={`question-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {question}
                {open === i ? <Minus size={18} /> : <Plus size={18} />}
              </button>
            </h3>
            <div
              id={`answer-${i}`}
              role="region"
              aria-labelledby={`question-${i}`}
              hidden={open !== i}
            >
              <p>{answer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Landing() {
  const hero = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const { scrollYProgress: heroProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : -65]);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <div className="landing">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <motion.div className="reading-progress" style={{ scaleX: progress }} />
        <header className="site-header">
          <a href="#" className="brand" aria-label="BlackBoxAI home">
            <span className="brand-symbol">
              <Box size={23} strokeWidth={1.6} />
            </span>
            BlackBox<span>AI</span>
            <i />
          </a>
          <nav
            className={menuOpen ? "primary-nav is-open" : "primary-nav"}
            aria-label="Main navigation"
          >
            <a href="#process" onClick={() => setMenuOpen(false)}>
              The process
            </a>
            <a href="#lab" onClick={() => setMenuOpen(false)}>
              The lab <span>03</span>
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>
          </nav>
          <a
            href={repository}
            target="_blank"
            rel="noreferrer"
            className="header-source"
          >
            <Github size={17} />
            <span>View source</span>
            <ArrowUpRight size={15} />
          </a>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </header>
        <main id="main">
          <section className="hero" ref={hero} aria-labelledby="hero-heading">
            <div className="hero-grid" aria-hidden="true" />
            <div className="hero-coordinate coordinate-left">
              BB / 001
              <br />
              FIRMWARE INTELLIGENCE
            </div>
            <div className="hero-coordinate coordinate-right">
              RESEARCH PROJECT
              <br />
              <span>
                <i className="status-dot" /> OPEN SOURCE
              </span>
            </div>
            <motion.div
              className="hero-title"
              style={{ y: titleY }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <span className="hero-eyebrow">
                <span /> LOOK BENEATH THE BINARY
              </span>
              <h1 id="hero-heading">
                Nothing stays
                <br />
                in the <span>black box.</span>
              </h1>
              <p>
                Cryptographic patterns. Hidden in firmware.
                <br />
                Brought into the open.
              </p>
            </motion.div>
            <div className="hero-object">
              <div className="object-orbit" aria-hidden="true" />
              <Suspense
                fallback={
                  <div className="core-loading">
                    <Box size={60} strokeWidth={0.5} />
                    <span>ASSEMBLING CORE</span>
                  </div>
                }
              >
                <FirmwareCore
                  opened={opened}
                  progress={heroProgress}
                  reduced={reduced}
                />
              </Suspense>
              <span className="object-label label-left">
                <span>INPUT / BINARY</span>
                <strong>Unknown by default.</strong>
                <i />
              </span>
              <span className="object-label label-right">
                <span>OUTPUT / EVIDENCE</span>
                <strong>Understood by design.</strong>
                <i />
              </span>
              <button
                className="core-toggle"
                onClick={() => setOpened(!opened)}
                aria-pressed={opened}
              >
                {opened ? <Minus size={14} /> : <Plus size={14} />}
                {opened ? "Reassemble core" : "Open the black box"}
              </button>
            </div>
            <div className="hero-bottom">
              <p>
                A firmware cryptography lab.
                <br />
                <span>Built for the curious. Open to inspection.</span>
              </p>
              <a href="#lab" className="button button-acid">
                Explore the lab <ArrowUpRight size={18} />
              </a>
              <a className="scroll-cue" href="#process">
                SCROLL TO INVESTIGATE <ArrowDown size={17} />
              </a>
            </div>
          </section>
          <div className="capability-strip">
            <span>READ BETWEEN THE BYTES</span>
            {[
              "BINARY ANALYSIS",
              "PATTERN RECOGNITION",
              "CRYPTOGRAPHIC INTELLIGENCE",
            ].map((item) => (
              <span key={item}>
                <Plus size={13} />
                {item}
              </span>
            ))}
            <span className="strip-end">
              <Cpu size={15} /> BLACKBOXAI
            </span>
          </div>
          <Pipeline />
          <section
            className="lab-section section-pad"
            id="lab"
            aria-labelledby="lab-heading"
          >
            <div className="section-kicker">
              <span>02 / HANDS ON</span>
              <span>NO SETUP. JUST CURIOSITY.</span>
            </div>
            <Reveal className="section-intro">
              <div>
                <span className="pill-label">
                  <span /> THE INTERACTIVE LAB
                </span>
                <h2 id="lab-heading">
                  Less mystery.
                  <br />
                  <span>More evidence.</span>
                </h2>
              </div>
              <p>
                Three samples. Three different stories.
                <br />
                Pick a binary and inspect what lies beneath.
              </p>
            </Reveal>
            <Reveal>
              <EvidenceLab />
            </Reveal>
            <div className="lab-section-foot">
              <span>
                <ShieldCheck size={16} /> Nothing leaves your browser.
              </span>
              <a href={repository} target="_blank" rel="noreferrer">
                Explore the real model pipelines <ArrowUpRight size={16} />
              </a>
            </div>
          </section>
          <section className="principles section-pad" id="approach">
            <div className="section-kicker">
              <span>03 / THE APPROACH</span>
              <span>ENGINEERED FOR INVESTIGATION</span>
            </div>
            <Reveal>
              <h2>
                Make the invisible
                <br />
                <span>investigable.</span>
              </h2>
            </Reveal>
            <div className="principle-grid">
              {[
                {
                  icon: Fingerprint,
                  title: "Patterns over guesswork.",
                  text: "Signatures and learned features bring structure to unfamiliar binaries. Every detection is a starting point for deeper inspection.",
                  tag: "SIGNATURES + MACHINE LEARNING",
                },
                {
                  icon: ScanLine,
                  title: "Context over scores.",
                  text: "Confidence alone isn't enough. Inspect primitives alongside byte distributions, metadata, and implementation details.",
                  tag: "EVIDENCE WITH CONTEXT",
                },
                {
                  icon: Code2,
                  title: "Open from the inside out.",
                  text: "Read the extraction code. Inspect the classifiers. Run your own experiments. The project is built to be taken apart, too.",
                  tag: "SOURCE AVAILABLE ON GITHUB",
                },
              ].map((item, i) => (
                <Reveal key={item.title} className="principle">
                  <div className="principle-top">
                    <item.icon size={28} strokeWidth={1.2} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span className="mono-label">{item.tag}</span>
                </Reveal>
              ))}
            </div>
          </section>
          <FAQ />
          <section className="closing section-pad">
            <div className="closing-grid" aria-hidden="true" />
            <Reveal>
              <span className="mono-label">THE NEXT DISCOVERY IS YOURS.</span>
              <h2>
                Go on.
                <br />
                Break it open<span>.</span>
              </h2>
              <a href="#lab" className="button button-dark">
                Enter the lab <ArrowUpRight size={18} />
              </a>
              <a
                href={repository}
                target="_blank"
                rel="noreferrer"
                className="closing-github"
              >
                Or take the source <Github size={17} />
                <ArrowUpRight size={14} />
              </a>
            </Reveal>
            <Box className="closing-box" strokeWidth={0.5} aria-hidden="true" />
            <span className="closing-foot">
              CURIOSITY IS A FEATURE. <Plus size={15} /> BLACKBOXAI / OPEN
              RESEARCH
            </span>
          </section>
        </main>
        <footer className="site-footer">
          <a href="#" className="brand">
            <Box size={20} />
            BlackBox<span>AI</span>
          </a>
          <span>Independent research. Open possibilities.</span>
          <a href={repository} target="_blank" rel="noreferrer">
            Built in the open <ArrowUpRight size={15} />
          </a>
          <a href="#main" aria-label="Back to top" className="back-top">
            <ArrowDown size={17} />
          </a>
        </footer>
      </div>
    </MotionConfig>
  );
}
