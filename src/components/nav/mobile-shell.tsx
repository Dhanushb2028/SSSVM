"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

/** Mobile-first, card-based shell for the Student and Parent portals (Section 2, Section 7). */
export function MobileShell({
  portalLabel,
  navItems,
  userName,
  logoutForm,
  headerExtra,
  children,
}: {
  portalLabel: string;
  navItems: NavItem[];
  userName: string;
  logoutForm: React.ReactNode;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            SS
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground">SSSVM {portalLabel}</p>
            <p className="text-xs leading-tight text-muted-foreground">{userName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          {logoutForm}
        </div>
      </header>

      <main id="main-content" className="flex-1 overflow-x-hidden px-4 py-4 pb-24">
        {children}
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-flow-col auto-cols-fr">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-2 text-xs",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
