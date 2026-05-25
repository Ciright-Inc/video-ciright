"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  isNavigationPending,
  useNavigationPending,
} from "@/components/providers/NavigationPendingProvider";
import { RouteLoadingFallback } from "@/components/layout/RouteLoadingFallback";
import { cn } from "@/lib/utils";

export function MainContentArea({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { pendingHref } = useNavigationPending();
  const pending = isNavigationPending(pendingHref, pathname);

  return (
    <div className="relative min-h-48">
      {pending && pendingHref ? (
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
        className={cn(pending && "sr-only")}
        aria-hidden={pending || undefined}
        inert={pending ? true : undefined}
      >
        {children}
      </div>
    </div>
  );
}
