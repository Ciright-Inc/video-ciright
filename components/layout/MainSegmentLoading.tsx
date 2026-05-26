"use client";

import { usePathname } from "next/navigation";
import {
  isNavigationPending,
  useNavigationPending,
} from "@/components/providers/NavigationPendingProvider";
import { RouteLoadingFallback } from "@/components/layout/RouteLoadingFallback";

/**
 * Segment loading UI for the (main) layout. When NavLink has already triggered
 * startNavigation, MainContentArea shows the skeleton — avoid a duplicate boundary.
 */
export function MainSegmentLoading() {
  const pathname = usePathname();
  const { pendingHref } = useNavigationPending();
  const pending = isNavigationPending(pendingHref, pathname);

  if (pending && pendingHref) {
    return null;
  }

  return <RouteLoadingFallback href={pendingHref ?? pathname} />;
}
