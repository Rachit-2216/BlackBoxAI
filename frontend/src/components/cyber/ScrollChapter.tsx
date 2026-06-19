import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type ScrollChapterProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: "left" | "right" | "center";
  accent?: "cyan" | "red" | "green" | "amber";
  children?: ReactNode;
  className?: string;
};

const accentClass = {
  cyan: "text-cyan-200 border-cyan-300/25 bg-cyan-300/[0.045]",
  red: "text-red-200 border-red-300/25 bg-red-400/[0.045]",
  green: "text-emerald-200 border-emerald-300/25 bg-emerald-300/[0.045]",
  amber: "text-amber-200 border-amber-300/25 bg-amber-300/[0.045]",
};

export function ScrollChapter({
  eyebrow,
  title,
  copy,
  align = "left",
  accent = "cyan",
  children,
  className,
}: ScrollChapterProps) {
  return (
    <motion.section
      className={cn(
        "scroll-chapter",
        align === "right" && "ml-auto text-right",
        align === "center" && "mx-auto text-center",
        className,
      )}
      initial={{ opacity: 0, y: 60, filter: "blur(16px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: false, amount: 0.34 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={cn("chapter-kicker", accentClass[accent])}>{eyebrow}</div>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
      {children && <div className="mt-8">{children}</div>}
    </motion.section>
  );
}

export default ScrollChapter;
