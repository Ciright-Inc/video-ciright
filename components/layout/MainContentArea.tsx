"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  isNavigationPending,
  isProfileSubnavigation,
  useNavigationPending,
} from "@/components/providers/NavigationPendingProvider";
import { RouteLoadingFallback } from "@/components/layout/RouteLoadingFallback";
import { cn } from "@/lib/utils";

export function MainContentArea({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { pendingHref } = useNavigationPending();
  const pending = isNavigationPending(pendingHref, pathname);
  const profileBodyPending = isProfileSubnavigation(pendingHref, pathname);

  return (
    <div className="relative min-h-48">
      {pending && pendingHref && !profileBodyPending ? (
        <div
          key={pendingHref}
          className="absolute inset-0 z-10 animate-in fade-in duration-150"
          aria-busy="true"
          aria-live="polite"
        >
          <RouteLoadingFallback href={pendingHref} />
        </div>
      ) : null}
      <div
        className={cn(
          pending && !profileBodyPending && "pointer-events-none invisible"
        )}
        aria-hidden={pending || undefined}
        inert={pending ? true : undefined}
      >
        {children}
      </div>
    </div>
  );
}
