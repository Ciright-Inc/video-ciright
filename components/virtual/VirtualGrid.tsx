"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { measureElement as defaultMeasureElement } from "@tanstack/react-virtual";
import { useMainScrollVirtualizer } from "@/hooks/use-main-scroll-virtualizer";
import { getRowContentEstimate, useColumnCount } from "@/hooks/use-column-count";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { useMainScrollElement } from "@/components/providers/MainScrollProvider";

/** Vertical space between virtual rows (matches gap-y-4). */
export const VIRTUAL_GRID_ROW_GAP_PX = 16;

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

function measureVirtualRow(
  element: Element,
  entry: ResizeObserverEntry | undefined,
  instance: Parameters<typeof defaultMeasureElement>[2]
) {
  return defaultMeasureElement(element as HTMLElement, entry, instance);
}

export function VirtualGrid<T>({
  items,
  getItemKey,
  renderItem,
  estimateRowSize,
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
  const rowEstimate =
    estimateRowSize ??
    getRowContentEstimate(columnCount) + VIRTUAL_GRID_ROW_GAP_PX;
  const rowCount = Math.ceil(items.length / columnCount) || 0;
  const parentRef = useRef<HTMLDivElement>(null);
  /** Single-column feeds use document flow — avoids absolute-row overlap on mobile */
  const preferStaticGrid = columnCount === 1;

  const rowVirtualizer = useMainScrollVirtualizer({
    count: rowCount,
    estimateSize: () => rowEstimate,
    overscan: 2,
    measureElement: measureVirtualRow,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const lastVirtualRowIndex = virtualRows.at(-1)?.index;

  useLayoutEffect(() => {
    if (preferStaticGrid) return;

    const scrollEl = scrollRef.current;
    const gridEl = parentRef.current;
    if (!scrollEl && !gridEl) return;

    rowVirtualizer.measure();

    const observer = new ResizeObserver(() => {
      rowVirtualizer.measure();
    });

    if (scrollEl) observer.observe(scrollEl);
    if (gridEl) observer.observe(gridEl);

    return () => observer.disconnect();
  }, [scrollRef, rowVirtualizer, rowCount, columnCount, preferStaticGrid]);

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
    preferStaticGrid ||
    !mounted ||
    (items.length > 0 && virtualRows.length === 0);

  if (useStaticGrid) {
    return (
      <div
        className={`grid w-full ${gapXClassName}`}
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          rowGap: VIRTUAL_GRID_ROW_GAP_PX,
        }}
      >
        {items.map((item) => (
          <div key={getItemKey(item)} className="min-w-0">
            {renderItem(item)}
          </div>
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
            data-last-row={isLastRow ? "" : undefined}
            ref={rowVirtualizer.measureElement}
            className="absolute left-0 top-0 w-full"
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div
              className={`grid w-full ${gapXClassName}`}
              style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                paddingBottom: isLastRow ? 0 : VIRTUAL_GRID_ROW_GAP_PX,
              }}
            >
              {rowItems.map((item) => (
                <div key={getItemKey(item)} className="min-w-0">
                  {renderItem(item)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
