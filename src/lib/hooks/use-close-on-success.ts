"use client";

import * as React from "react";

/**
 * Closes a dialog exactly once when a useActionState result flips to
 * success. Written as state derived during render (comparing against the
 * previously-seen state) rather than a useEffect, per React's guidance that
 * synchronizing local state from a prop/state change belongs in render, not
 * an effect — see https://react.dev/learn/you-might-not-need-an-effect.
 */
export function useCloseOnSuccess(state: { success?: boolean } | undefined, close: () => void) {
  const [seen, setSeen] = React.useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state?.success) close();
  }
}
