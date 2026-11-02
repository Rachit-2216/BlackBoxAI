import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

const alphabet = "01ABCDEF_/#";

export function DecodeText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const node = useRef<HTMLSpanElement>(null);
  const visible = useInView(node, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    if (!visible || reduced) {
      setDisplay(text);
      return;
    }
    let frame: number;
    let start: number;
    function update(now: number) {
      start ??= now;
      const progress = Math.min((now - start) / 850, 1);
      setDisplay(
        text
          .split("")
          .map((letter, index) =>
            letter === " " || index < progress * (text.length + 5)
              ? letter
              : alphabet[
                  (index * 7 + Math.floor((now - start) / 70)) % alphabet.length
                ],
          )
          .join(""),
      );
      if (progress < 1) frame = requestAnimationFrame(update);
    }
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [visible, reduced, text, replay]);
  return (
    <span
      ref={node}
      className={`decode-text ${className}`}
      onPointerEnter={() => setReplay((value) => value + 1)}
    >
      <span className="sr-only">{text}</span>
      <span className="decode-size" aria-hidden="true">
        {text}
      </span>
      <span className="decode-live" aria-hidden="true">
        {display}
      </span>
    </span>
  );
}

function ScrollWord({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const color = useTransform(
    progress,
    [index / total, (index + 0.8) / total],
    ["#70776c", "#f0f3e9"],
  );
  const y = useTransform(
    progress,
    [index / total, (index + 0.8) / total],
    [12, 0],
  );
  return <motion.span style={{ color, y }}>{word} </motion.span>;
}

export function ScrollStatement({ text }: { text: string }) {
  const node = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: node,
    offset: ["start 85%", "end 40%"],
  });
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <p ref={node} className="scroll-statement">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) =>
          reduced ? (
            <span key={index}>{word} </span>
          ) : (
            <ScrollWord
              key={index}
              word={word}
              index={index}
              total={words.length}
              progress={scrollYProgress}
            />
          ),
        )}
      </span>
    </p>
  );
}
