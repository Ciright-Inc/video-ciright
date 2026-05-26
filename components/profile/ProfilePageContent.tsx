"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { RouteLoadingFallback } from "@/components/layout/RouteLoadingFallback";
import {
  isProfileSubnavigation,
  useNavigationPending,
} from "@/components/providers/NavigationPendingProvider";
import { hasCachedProfileTabData } from "@/lib/queries/profile-tab-cache";
import { cn } from "@/lib/utils";

/** Pending state for profile routes below the persistent hub chrome. */
export function ProfilePageContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { pendingHref } = useNavigationPending();
  const profileNav = isProfileSubnavigation(pendingHref, pathname);
  const destinationCached =
    profileNav &&
    pendingHref !== null &&
    hasCachedProfileTabData(queryClient, pendingHref);
  const showSkeleton =
    profileNav &&
    pendingHref !== null &&
    !destinationCached;

  return (
    <div className="relative min-h-32">
      {showSkeleton ? (
        <div
          key={pendingHref}
          className="animate-in fade-in duration-150"
          aria-busy="true"
          aria-live="polite"
        >
          <RouteLoadingFallback href={pendingHref} />
        </div>
      ) : null}
      <div
        className={cn(showSkeleton && "invisible")}
        aria-hidden={showSkeleton || undefined}
        inert={showSkeleton ? true : undefined}
      >
        {children}
      </div>
    </div>
  );
}
