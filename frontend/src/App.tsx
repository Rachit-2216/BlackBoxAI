import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FloatingCommandNav } from "@/components/layout/FloatingCommandNav";
import { AnalysisStoreProvider } from "@/lib/analysis-store";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AnalysisResults from "./pages/AnalysisResults";
import ProtocolMapping from "./pages/ProtocolMapping";
import RiskCompliance from "./pages/RiskCompliance";
import ApiIntegration from "./pages/ApiIntegration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AnalysisStoreProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <FloatingCommandNav />
            <main className="min-h-screen pb-24">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/results" element={<AnalysisResults />} />
                <Route path="/protocol" element={<ProtocolMapping />} />
                <Route path="/compliance" element={<RiskCompliance />} />
                <Route path="/api" element={<ApiIntegration />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AnalysisStoreProvider>
  </QueryClientProvider>
);

export default App;
