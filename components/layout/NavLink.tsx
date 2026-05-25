"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useNavigationPending } from "@/components/providers/NavigationPendingProvider";

type NavLinkProps = ComponentProps<typeof Link>;

export function NavLink({ href, onClick, prefetch = true, ...props }: NavLinkProps) {
  const { startNavigation } = useNavigationPending();

  const hrefString =
    typeof href === "string"
      ? href
      : typeof href === "object" && href !== null && "pathname" in href
        ? href.pathname ?? "/"
        : "/";

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={(event) => {
        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          startNavigation(hrefString);
        }
        onClick?.(event);
      }}
      {...props}
    />
  );
}
