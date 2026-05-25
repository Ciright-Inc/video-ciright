"use client";

import { usePathname } from "next/navigation";
import {
  isNavigationPending,
  useNavigationPending,
} from "@/components/providers/NavigationPendingProvider";
import { cn } from "@/lib/utils";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const { pendingHref } = useNavigationPending();
  const pending = isNavigationPending(pendingHref, pathname);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden md:top-14"
      aria-hidden
    >
      <div
        className={cn(
          "h-full origin-left bg-primary transition-opacity duration-150",
          pending ? "opacity-100 motion-safe:animate-navigation-progress" : "opacity-0"
        )}
      />
    </div>
  );
}
