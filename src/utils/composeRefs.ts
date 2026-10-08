// No "use client": this module calls only `useCallback`, which runs in React's
// server build and is not a client trigger under the package's directive rule.
// Every component that calls `useComposedRefs` carries its own directive when it
// needs one.
import { useCallback, type Ref, type RefCallback } from "react";

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}

/**
 * Internal (not exported from src/index.ts). One callback ref that writes the
 * node into every given ref. Memoized on the refs themselves, so React does
 * not detach and re-attach a consumer's callback ref on every render, which
 * an inline merge would do.
 */
export function useComposedRefs<T>(
  ...refs: (Ref<T> | undefined)[]
): RefCallback<T> {
  // Each call site passes a fixed number of refs, so `refs` is a
  // stable-length dependency list.
  return useCallback((node: T | null) => {
    for (const ref of refs) assignRef(ref, node);
  }, refs);
}
