import * as React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Status is always conveyed with an icon + text label, never color alone (Section 8).
const TONES = {
  success: { className: "bg-success-soft text-success", Icon: CheckCircle2 },
  danger: { className: "bg-danger-soft text-danger", Icon: XCircle },
  warning: { className: "bg-warning-soft text-warning", Icon: AlertTriangle },
  neutral: { className: "bg-background text-muted-foreground", Icon: Circle },
  pending: { className: "bg-gold-soft text-gold-foreground", Icon: Clock },
} as const;

export function StatusBadge({
  tone,
  children,
  className,
  ...props
}: {
  tone: keyof typeof TONES;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  const { className: toneClassName, Icon } = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClassName,
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {children}
    </span>
  );
}
