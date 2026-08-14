"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}
export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Dense, desktop-first shell for the Admin and Teacher portals (Section 2, Section 7). */
export function DesktopShell({
  portalLabel,
  navSections,
  userName,
  userRoleLabel,
  logoutForm,
  children,
}: {
  portalLabel: string;
  navSections: NavSection[];
  userName: string;
  userRoleLabel: string;
  logoutForm: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = React.useState(false);

  const navList = (
    <ul className="flex flex-col gap-4">
      {navSections.map((section) => (
        <li key={section.title}>
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {section.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setNavOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-background",
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md p-2 hover:bg-background md:hidden"
            aria-expanded={navOpen}
            aria-controls="portal-nav"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            onClick={() => setNavOpen((v) => !v)}
          >
            {navOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <div
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            SS
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground">SSSVM {portalLabel}</p>
            <p className="text-xs leading-tight text-muted-foreground">K.R.M. Colony</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-foreground">{userName}</p>
            <p className="text-xs leading-tight text-muted-foreground">{userRoleLabel}</p>
          </div>
          {logoutForm}
        </div>
      </header>
      <div className="flex flex-1">
        <nav
          id="portal-nav"
          aria-label="Main"
          className={cn(
            "w-64 shrink-0 border-r border-border bg-surface p-3",
            navOpen ? "block" : "hidden",
            "md:block",
            navOpen && "absolute z-20 h-[calc(100vh-3.5rem)] shadow-lg md:static md:z-auto md:shadow-none",
          )}
        >
          {navList}
        </nav>
        <main id="main-content" className="flex-1 overflow-x-hidden p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
