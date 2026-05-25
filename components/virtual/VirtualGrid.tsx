"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useMainScrollVirtualizer } from "@/hooks/use-main-scroll-virtualizer";
import { useColumnCount } from "@/hooks/use-column-count";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useMainScrollElement } from "@/components/providers/MainScrollProvider";

/** gap-y-8 (32px) is applied between virtual rows, not inside each row grid */
const ROW_GAP_PX = 32;
const DEFAULT_ROW_ESTIMATE = 320 + ROW_GAP_PX;
const LOAD_MORE_THRESHOLD = 3;

export interface VirtualGridProps<T> {
  items: T[];
  getItemKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  estimateRowSize?: number;
  columnCount?: number;
  gapXClassName?: string;
  onNearEnd?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function VirtualGrid<T>({
  items,
  getItemKey,
  renderItem,
  estimateRowSize = DEFAULT_ROW_ESTIMATE,
  columnCount: columnCountProp,
  gapXClassName = "gap-x-4",
  onNearEnd,
  hasMore,
  isLoadingMore,
}: VirtualGridProps<T>) {
  const mounted = useIsMounted();
  const scrollRef = useMainScrollElement();
  const responsiveColumnCount = useColumnCount();
  const columnCount = columnCountProp ?? responsiveColumnCount;
  const rowCount = Math.ceil(items.length / columnCount) || 0;
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useMainScrollVirtualizer({
    count: rowCount,
    estimateSize: () => estimateRowSize,
    overscan: 2,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const lastVirtualRowIndex = virtualRows.at(-1)?.index;

  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    rowVirtualizer.measure();
    const observer = new ResizeObserver(() => {
      rowVirtualizer.measure();
    });
    observer.observe(scrollEl);
    return () => observer.disconnect();
  }, [scrollRef, rowVirtualizer, rowCount, columnCount]);

  useEffect(() => {
    if (
      lastVirtualRowIndex == null ||
      !onNearEnd ||
      !hasMore ||
      isLoadingMore
    ) {
      return;
    }
    if (lastVirtualRowIndex >= rowCount - LOAD_MORE_THRESHOLD) {
      onNearEnd();
    }
  }, [lastVirtualRowIndex, rowCount, onNearEnd, hasMore, isLoadingMore]);

  const useStaticGrid =
    !mounted || (items.length > 0 && virtualRows.length === 0);

  if (useStaticGrid) {
    return (
      <div
        className={`grid w-full ${gapXClassName}`}
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          rowGap: ROW_GAP_PX,
        }}
      >
        {items.map((item) => (
          <div key={getItemKey(item)}>{renderItem(item)}</div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      style={{
        height: rowVirtualizer.getTotalSize(),
        position: "relative",
        width: "100%",
      }}
    >
      {virtualRows.map((virtualRow) => {
        const startIndex = virtualRow.index * columnCount;
        const rowItems = items.slice(startIndex, startIndex + columnCount);

        const isLastRow = virtualRow.index >= rowCount - 1;

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            className={`absolute left-0 top-0 grid w-full ${gapXClassName}`}
            style={{
              transform: `translateY(${virtualRow.start}px)`,
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              paddingBottom: isLastRow ? 0 : ROW_GAP_PX,
            }}
          >
            {rowItems.map((item) => (
              <div key={getItemKey(item)}>{renderItem(item)}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
