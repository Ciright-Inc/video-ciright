"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SessionExpiredContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerSessionExpired: () => void;
};

const SessionExpiredContext = createContext<SessionExpiredContextValue | null>(
  null
);

export function SessionExpiredProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const triggerSessionExpired = useCallback(() => {
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, triggerSessionExpired }),
    [open, triggerSessionExpired]
  );

  return (
    <SessionExpiredContext.Provider value={value}>
      {children}
    </SessionExpiredContext.Provider>
  );
}

export function useSessionExpired() {
  const ctx = useContext(SessionExpiredContext);
  if (!ctx) {
    throw new Error("useSessionExpired must be used within SessionExpiredProvider");
  }
  return ctx;
}
