"use client";

import * as React from "react";

class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // A chart failing to render must never blank out the surrounding page (Section 11 #2/#6).
    console.error("[chart] render failed, showing accessible fallback", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Shared chart wrapper: the container element always exists before the
 * charting library mounts into it, a render failure degrades to the
 * accessible fallback instead of an empty section, and the fallback (a
 * text/table summary) is always available — not just on error — to satisfy
 * Section 8's "accessible alternative to every chart" requirement.
 */
export function ChartContainer({
  title,
  chart,
  fallback,
  className,
}: {
  title: string;
  chart: React.ReactNode;
  fallback: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="sr-only">{title}</h3>
      <div className="min-h-[200px]" data-testid="chart-mount">
        <ChartErrorBoundary fallback={fallback}>{chart}</ChartErrorBoundary>
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer select-none text-muted-foreground hover:text-foreground">
          View as table
        </summary>
        <div className="mt-2">{fallback}</div>
      </details>
    </div>
  );
}
