"use client";

import {
  createContext,
  useContext,
  useRef,
  type RefObject,
} from "react";

const MainScrollContext = createContext<RefObject<HTMLElement | null> | null>(
  null
);

export function MainScrollProvider({
  children,
  scrollRef,
}: {
  children: React.ReactNode;
  scrollRef: RefObject<HTMLElement | null>;
}) {
  return (
    <MainScrollContext.Provider value={scrollRef}>
      {children}
    </MainScrollContext.Provider>
  );
}

export function useMainScrollElement() {
  const ref = useContext(MainScrollContext);
  if (!ref) {
    throw new Error("useMainScrollElement must be used within MainScrollProvider");
  }
  return ref;
}

export function useMainScrollRef() {
  return useRef<HTMLElement | null>(null);
}
