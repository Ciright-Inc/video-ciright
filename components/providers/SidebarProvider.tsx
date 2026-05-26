"use client";

import {
  createContext,
  useCallback,
  useContext,
} from "react";
import { useLocalStorageBoolean } from "@/hooks/use-local-storage-boolean";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useLocalStorageBoolean(
    SIDEBAR_COLLAPSED_KEY,
    false
  );

  const setCollapsed = useCallback(
    (value: boolean) => {
      setCollapsedState(value);
    },
    [setCollapsedState]
  );

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
