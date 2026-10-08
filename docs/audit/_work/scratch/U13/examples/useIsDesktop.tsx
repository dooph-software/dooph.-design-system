// responsive-sheet-modal.md:29-46 verbatim (ex10)
"use client";
import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)"; // your breakpoint

export function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => true, // SSR fallback — pick the variant you prefer to hydrate as
  );
}
