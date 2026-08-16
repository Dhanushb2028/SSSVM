"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const THEME_STORAGE_KEY = "sssvm-theme";
const THEME_EVENT = "sssvm-theme-change";
type ThemePreference = "vivid" | "classic";

function applyTheme(theme: ThemePreference) {
  if (theme === "classic") {
    document.documentElement.setAttribute("data-theme", "classic");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): ThemePreference {
  return document.documentElement.getAttribute("data-theme") === "classic" ? "classic" : "vivid";
}

function getServerSnapshot(): ThemePreference {
  return "vivid";
}

/**
 * Lets the user pick between the colorful "Vivid" canvas and the flat
 * "Classic" surfaces, before or after sign-in. Persisted in localStorage and
 * read synchronously by the root layout's inline script to avoid a flash;
 * useSyncExternalStore keeps this in sync with that DOM attribute without a
 * setState-in-effect hydration mismatch.
 */
export function ThemeToggle({
  className,
  surface = "canvas",
}: {
  className?: string;
  /** "canvas" = sits on the colorful gradient (login panel, sidebar); "surface" = sits on a light card/header. */
  surface?: "canvas" | "surface";
}) {
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const choose = (next: ThemePreference) => {
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private mode, etc.) — theme just won't persist.
    }
  };

  const onCanvas = surface === "canvas";

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border p-1 text-xs font-medium backdrop-blur-sm",
        onCanvas ? "border-[var(--on-canvas-border)] bg-black/10" : "border-border bg-background",
        className,
      )}
    >
      {(
        [
          { value: "vivid", label: "Vivid" },
          { value: "classic", label: "Classic" },
        ] as const
      ).map(({ value, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(value)}
            className={cn(
              "rounded-full px-3 py-1 transition-colors",
              active
                ? "bg-gold-strong text-gold-foreground shadow-sm"
                : onCanvas
                  ? "text-[var(--on-canvas)] hover:bg-[var(--on-canvas-hover)]"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
