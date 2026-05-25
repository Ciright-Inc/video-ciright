"use client";

import { useSyncExternalStore } from "react";

/** False during SSR and the first client paint; true after hydration. */
export function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
