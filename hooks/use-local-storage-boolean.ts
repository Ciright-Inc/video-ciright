"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(key: string, onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) onStoreChange();
  };
  const onCustom = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(`${key}-change`, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(`${key}-change`, onCustom);
  };
}

function readBoolean(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (stored === null) return fallback;
  return stored === "true";
}

export function useLocalStorageBoolean(key: string, fallback = false) {
  const value = useSyncExternalStore(
    (onStoreChange) => subscribe(key, onStoreChange),
    () => readBoolean(key, fallback),
    () => fallback
  );

  const setValue = useCallback(
    (next: boolean) => {
      localStorage.setItem(key, String(next));
      window.dispatchEvent(new Event(`${key}-change`));
    },
    [key]
  );

  return [value, setValue] as const;
}
