import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function QuickLinksGrid({ links }: { links: { label: string; href: string; icon: LucideIcon }[] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {links.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface p-3 text-center text-xs text-foreground hover:bg-background"
        >
          <Icon aria-hidden="true" className="size-5 text-primary" />
          {label}
        </Link>
      ))}
    </div>
  );
}
