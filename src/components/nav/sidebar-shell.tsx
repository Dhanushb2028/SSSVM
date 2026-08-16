"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export type SidebarLink = { type: "link"; label: string; href: string; icon: React.ReactNode };
export type SidebarGroup = {
  type: "group";
  title: string;
  icon: React.ReactNode;
  items: { label: string; href: string; icon: React.ReactNode }[];
};
export type SidebarEntry = SidebarLink | SidebarGroup;

function isActivePath(pathname: string | null, href: string) {
  return pathname === href || pathname?.startsWith(href + "/");
}

/** Collapsible sidebar with accordion groups, shared by every portal — admin/teacher get
 * grouped dropdowns for their many pages, student/parent get a flat list since they only
 * have a handful of top-level destinations. Same shell either way. */
export function SidebarShell({
  portalLabel,
  entries,
  userName,
  userRoleLabel,
  logoutForm,
  children,
}: {
  portalLabel: string;
  entries: SidebarEntry[];
  userName: string;
  userRoleLabel: string;
  logoutForm: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(() => {
    const activeGroup = entries.find(
      (e): e is SidebarGroup => e.type === "group" && e.items.some((i) => isActivePath(pathname, i.href)),
    );
    return new Set(activeGroup ? [activeGroup.title] : []);
  });

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen">
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "bg-app-gradient fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--on-canvas-border)] transition-[width,transform] duration-200 md:static md:z-auto md:translate-x-0",
          collapsed ? "md:w-16" : "md:w-64",
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div
          className="flex h-16 shrink-0 items-center justify-between gap-2 px-3 text-white"
          style={{ background: "var(--hero-gradient)" }}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-strong text-sm font-bold text-gold-foreground"
            >
              SS
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="truncate text-sm font-semibold leading-tight">SSSVM {portalLabel}</p>
                <p className="truncate text-xs leading-tight text-white/70">K.R.M. Colony</p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="rounded p-1 hover:bg-primary-soft/20 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {entries.map((entry) => {
            if (entry.type === "link") {
              const active = isActivePath(pathname, entry.href);
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? entry.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-[var(--on-canvas)] hover:bg-[var(--on-canvas-hover)]",
                  )}
                >
                  {entry.icon}
                  {!collapsed && <span className="truncate">{entry.label}</span>}
                </Link>
              );
            }

            const open = !collapsed && openGroups.has(entry.title);
            const groupActive = entry.items.some((i) => isActivePath(pathname, i.href));
            return (
              <div key={entry.title}>
                <button
                  type="button"
                  onClick={() => (collapsed ? setCollapsed(false) : toggleGroup(entry.title))}
                  aria-expanded={open}
                  title={collapsed ? entry.title : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--on-canvas-hover)]",
                    groupActive ? "text-[var(--on-canvas-active)]" : "text-[var(--on-canvas)]",
                  )}
                >
                  {entry.icon}
                  {!collapsed && <span className="flex-1 truncate text-left">{entry.title}</span>}
                  {!collapsed &&
                    (open ? (
                      <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
                    ) : (
                      <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
                    ))}
                </button>
                {open && (
                  <div className="ml-4 flex flex-col gap-0.5 border-l border-[var(--on-canvas-border)] py-1 pl-3">
                    {entry.items.map((item) => {
                      const active = isActivePath(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                            active
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-[var(--on-canvas)] hover:bg-[var(--on-canvas-hover)]",
                          )}
                        >
                          {item.icon}
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="hidden shrink-0 items-center justify-center gap-2 border-t border-[var(--on-canvas-border)] p-3 text-xs text-[var(--on-canvas-muted)] transition-colors hover:bg-[var(--on-canvas-hover)] md:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" className="size-4" />
          ) : (
            <>
              <PanelLeftClose aria-hidden="true" className="size-4" />
              Collapse
            </>
          )}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--on-canvas-border)] bg-[var(--header-bg)] px-3 backdrop-blur-md sm:px-4">
          <button
            type="button"
            className="rounded-md p-2 text-foreground hover:bg-background md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu aria-hidden="true" />
          </button>
          <ThemeToggle surface="surface" className="hidden sm:inline-flex" />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-foreground">{userName}</p>
              <p className="text-xs leading-tight text-muted-foreground">{userRoleLabel}</p>
            </div>
            {logoutForm}
          </div>
        </header>
        <main id="main-content" className="bg-app-gradient flex-1 overflow-x-hidden p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
