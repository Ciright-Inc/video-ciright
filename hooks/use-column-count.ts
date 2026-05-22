"use client";

import { useSyncExternalStore } from "react";

const QUERIES = [
  { query: "(min-width: 1280px)", columns: 4 },
  { query: "(min-width: 1024px)", columns: 3 },
  { query: "(min-width: 640px)", columns: 2 },
] as const;

function getColumnCount(): number {
  if (typeof window === "undefined") return 1;
  for (const { query, columns } of QUERIES) {
    if (window.matchMedia(query).matches) return columns;
  }
  return 1;
}

function subscribe(onStoreChange: () => void) {
  const media = QUERIES.map(({ query }) => window.matchMedia(query));
  const handler = () => onStoreChange();
  for (const mql of media) {
    mql.addEventListener("change", handler);
  }
  return () => {
    for (const mql of media) {
      mql.removeEventListener("change", handler);
    }
  };
}

export function useColumnCount() {
  return useSyncExternalStore(subscribe, getColumnCount, () => 1);
}
