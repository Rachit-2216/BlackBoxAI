import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, RadioTower, Search } from "lucide-react";
import { API_BASE_URL, checkHealth } from "@/lib/api";
import { useAnalysisStore } from "@/lib/analysis-store";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { latestRun, usingDemoData } = useAnalysisStore();
  const { data, isError, isLoading } = useQuery({
    queryKey: ["api-health"],
    queryFn: checkHealth,
    retry: 1,
    refetchInterval: 30000,
  });

  const connected = data?.status === "ok";

  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-2xl lg:left-72">
      <div className="mx-auto flex h-16 w-full max-w-[1720px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-none border border-white/10 bg-white/[0.03] px-3 py-2 sm:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="truncate font-mono text-xs text-muted-foreground">
            {latestRun.input.filename} / {latestRun.summary.topPrediction} / {latestRun.summary.riskLevel.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 border px-3 py-2 font-mono text-xs",
              connected
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                : "border-amber-300/30 bg-amber-300/10 text-amber-200",
            )}
          >
            {connected ? <RadioTower className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{isLoading ? "CHECKING" : connected ? "API LIVE" : isError ? "OFFLINE" : "DEMO"}</span>
          </div>

          <div className="hidden items-center gap-2 border border-white/10 px-3 py-2 font-mono text-xs text-muted-foreground md:flex">
            <Activity className="h-4 w-4 text-cyan-200" />
            <span>{usingDemoData ? "SAMPLE RUNS" : "LOCAL RUNS"}</span>
          </div>

          <code className="hidden max-w-[280px] truncate text-xs text-muted-foreground xl:block">{API_BASE_URL}</code>
        </div>
      </div>
    </header>
  );
};
