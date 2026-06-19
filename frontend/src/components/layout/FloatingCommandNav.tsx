import { Link, useLocation } from "react-router-dom";
import { Box, Code2, FileSearch, Network, Radar, Shield, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, checkHealth } from "@/lib/api";
import { useAnalysisStore } from "@/lib/analysis-store";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Radar, label: "Core", path: "/" },
  { icon: Upload, label: "Ingest", path: "/upload" },
  { icon: FileSearch, label: "Evidence", path: "/results" },
  { icon: Network, label: "Protocol", path: "/protocol" },
  { icon: Shield, label: "Risk", path: "/compliance" },
  { icon: Code2, label: "API", path: "/api" },
];

export function FloatingCommandNav() {
  const location = useLocation();
  const { usingDemoData } = useAnalysisStore();
  const { data } = useQuery({
    queryKey: ["api-health"],
    queryFn: checkHealth,
    retry: 1,
    refetchInterval: 30000,
  });

  const connected = data?.status === "ok";

  return (
    <>
      <header className="floating-command-nav">
        <Link to="/" className="floating-command-nav__brand">
          <span className="brand-mark">
            <Box className="h-6 w-6 text-emerald-100" />
          </span>
          <span>
            <span className="block font-display text-xl font-semibold leading-none">BlackBoxAI</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">crypto firmware lab</span>
          </span>
        </Link>

        <nav className="floating-command-nav__links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-4 font-mono text-xs uppercase tracking-[0.12em] transition-colors",
                  active ? "text-emerald-100" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="floating-nav-active"
                    className="absolute inset-x-2 bottom-1 top-1 border border-emerald-300/20 bg-emerald-300/10 shadow-[0_0_28px_rgba(74,222,128,0.16)]"
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="floating-command-nav__status">
          <span
            className={cn(
              "api-status-pill",
              connected ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-red-300/25 bg-red-400/10 text-red-100",
            )}
          >
            {connected ? "api live" : "offline mode"}
          </span>
          <code className="max-w-[170px] truncate text-[10px] text-muted-foreground">{usingDemoData ? "sample memory" : API_BASE_URL}</code>
        </div>
      </header>

      <nav className="fixed bottom-4 left-1/2 z-50 grid w-[min(560px,calc(100vw-24px))] -translate-x-1/2 grid-cols-6 rounded-full border border-white/10 bg-black/75 p-1 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "grid place-items-center rounded-full py-3",
                active ? "bg-cyan-300/10 text-cyan-100" : "text-muted-foreground",
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default FloatingCommandNav;
