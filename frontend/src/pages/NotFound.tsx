import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <section className="command-panel max-w-xl p-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10">
          <Radar className="h-9 w-9 text-cyan-100" />
        </div>
        <p className="telemetry-label">route not found</p>
        <h1 className="mt-3 text-5xl font-semibold">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          `{location.pathname}` is outside the BlackBoxAI command surface.
        </p>
        <Button asChild className="cyber-button mt-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </section>
    </div>
  );
};

export default NotFound;
