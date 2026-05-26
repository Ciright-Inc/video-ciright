"use client";

import {
  useVirtualizer,
  type PartialKeys,
  type VirtualizerOptions,
} from "@tanstack/react-virtual";
import { useMainScrollElement } from "@/components/providers/MainScrollProvider";

type MainScrollVirtualizerOptions<TItemElement extends Element> = PartialKeys<
  VirtualizerOptions<HTMLElement, TItemElement>,
  "getScrollElement" | "observeElementRect" | "observeElementOffset" | "scrollToFn"
>;

export function useMainScrollVirtualizer<TItemElement extends Element>(
  options: MainScrollVirtualizerOptions<TItemElement>
) {
  const scrollRef = useMainScrollElement();

  // eslint-disable-next-line react-hooks/incompatible-library -- expected library limitation
  return useVirtualizer<HTMLElement, TItemElement>({
    ...options,
    getScrollElement: () => scrollRef.current,
  });
}
