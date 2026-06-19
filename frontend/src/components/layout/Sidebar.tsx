import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  Code2,
  FileSearch,
  LayoutDashboard,
  Network,
  Shield,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Command", path: "/" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: FileSearch, label: "Results", path: "/results" },
  { icon: Network, label: "Protocol", path: "/protocol" },
  { icon: Shield, label: "Risk", path: "/compliance" },
  { icon: Code2, label: "API", path: "/api" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-black/45 px-5 py-6 backdrop-blur-2xl lg:block">
        <Link to="/" className="group flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center border border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,0.22)]">
            <Activity className="h-6 w-6 text-cyan-200" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold tracking-wide">BlackBoxAI</p>
            <p className="font-mono text-xs uppercase text-muted-foreground">crypto firmware lab</p>
          </div>
        </Link>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-3 border border-transparent px-4 py-3 font-medium transition-colors",
                  isActive
                    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                    : "text-muted-foreground hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-y-2 left-0 w-1 bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.75)]"
                  />
                )}
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 border border-emerald-300/20 bg-emerald-300/5 p-4">
          <p className="font-mono text-xs uppercase text-emerald-200">engine status</p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">standard + proprietary</span>
            <span className="h-2 w-2 bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-6 border-t border-white/10 bg-black/80 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-3 text-[11px]",
                isActive ? "text-cyan-200" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
