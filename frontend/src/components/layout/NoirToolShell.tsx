import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type NoirToolShellProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  tone?: "cyan" | "red" | "green" | "amber";
  action?: ReactNode;
  children: ReactNode;
};

const toneClass = {
  cyan: "from-cyan-300/16 via-transparent to-cyan-300/5",
  red: "from-red-400/16 via-transparent to-red-400/5",
  green: "from-emerald-300/16 via-transparent to-emerald-300/5",
  amber: "from-amber-300/16 via-transparent to-amber-300/5",
};

export function NoirToolShell({ eyebrow, title, copy, tone = "cyan", action, children }: NoirToolShellProps) {
  return (
    <div className="noir-tool-shell">
      <motion.section
        className={cn("noir-tool-hero bg-gradient-to-br", toneClass[tone])}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="noir-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {copy && <p className="noir-tool-copy">{copy}</p>}
        </div>
        {action && <div className="noir-tool-action">{action}</div>}
      </motion.section>
      <div className="noir-tool-content">{children}</div>
    </div>
  );
}

export default NoirToolShell;
