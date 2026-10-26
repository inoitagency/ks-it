"use client";

import { useCallback, useSyncExternalStore } from "react";

/** null during SSR/hydration so CSS can select the initial layout safely. */
export function useMediaQuery(query: string): boolean | null {
  const subscribe = useCallback((notify: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", notify);
    return () => media.removeEventListener("change", notify);
  }, [query]);
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
