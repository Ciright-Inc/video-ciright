"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

const LOAD_MORE_THRESHOLD = 5;

export interface VirtualListProps<T> {
  items: T[];
  getItemKey: (item: T) => string;
  renderRow: (item: T) => React.ReactNode;
  estimateSize?: number;
  scrollRef?: RefObject<HTMLElement | null>;
  onNearEnd?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  className?: string;
}

export function VirtualList<T>({
  items,
  getItemKey,
  renderRow,
  estimateSize = 120,
  scrollRef,
  onNearEnd,
  hasMore,
  isLoadingMore,
  className,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // TanStack Virtual returns unstable function refs; React Compiler skips memoization.
  // eslint-disable-next-line react-hooks/incompatible-library -- expected library limitation
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef?.current ?? null,
    estimateSize: () => estimateSize,
    overscan: 5,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastVirtualIndex = virtualItems.at(-1)?.index;

  useEffect(() => {
    if (
      lastVirtualIndex == null ||
      !onNearEnd ||
      !hasMore ||
      isLoadingMore
    ) {
      return;
    }
    if (lastVirtualIndex >= items.length - LOAD_MORE_THRESHOLD) {
      onNearEnd();
    }
  }, [lastVirtualIndex, items.length, onNearEnd, hasMore, isLoadingMore]);

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        height: virtualizer.getTotalSize(),
        position: "relative",
        width: "100%",
      }}
    >
      {virtualItems.map((virtualRow) => {
        const item = items[virtualRow.index];
        if (!item) return null;

        return (
          <div
            key={getItemKey(item)}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className="absolute left-0 top-0 w-full"
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderRow(item)}
          </div>
        );
      })}
    </div>
  );
}
