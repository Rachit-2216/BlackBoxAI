import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AnalysisRun } from "./api";
import { sampleRuns } from "./sample-analysis";

interface AnalysisStoreValue {
  runs: AnalysisRun[];
  displayRuns: AnalysisRun[];
  latestRun: AnalysisRun;
  addRun: (run: AnalysisRun) => void;
  clearRuns: () => void;
  usingDemoData: boolean;
}

const STORAGE_KEY = "blackboxai.analysisRuns.v1";
const AnalysisStoreContext = createContext<AnalysisStoreValue | null>(null);

function readStoredRuns(): AnalysisRun[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function AnalysisStoreProvider({ children }: { children: ReactNode }) {
  const [runs, setRuns] = useState<AnalysisRun[]>(() => readStoredRuns());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(runs.slice(0, 12)));
  }, [runs]);

  const value = useMemo<AnalysisStoreValue>(() => {
    const displayRuns = runs.length > 0 ? runs : sampleRuns;
    return {
      runs,
      displayRuns,
      latestRun: displayRuns[0],
      addRun: (run) => setRuns((current) => [{ ...run, createdAt: run.createdAt || new Date().toISOString() }, ...current].slice(0, 12)),
      clearRuns: () => setRuns([]),
      usingDemoData: runs.length === 0,
    };
  }, [runs]);

  return <AnalysisStoreContext.Provider value={value}>{children}</AnalysisStoreContext.Provider>;
}

export function useAnalysisStore() {
  const value = useContext(AnalysisStoreContext);
  if (!value) {
    throw new Error("useAnalysisStore must be used inside AnalysisStoreProvider");
  }
  return value;
}
