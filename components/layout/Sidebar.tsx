"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { primaryNavItems } from "@/components/layout/nav-items";
import { SidebarNavIcon } from "@/components/layout/SidebarNavIcon";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/SidebarProvider";

const SIDEBAR_WIDTH_COLLAPSED = 72;
const SIDEBAR_WIDTH_EXPANDED = 240;

const sidebarTransition = {
  duration: 0.28,
  ease: [0.4, 0, 0.2, 1] as const,
};

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const reducedMotion = useReducedMotion();
  const transition = reducedMotion ? { duration: 0 } : sidebarTransition;

  return (
    <motion.aside
      role="navigation"
      aria-label="Primary"
      initial={false}
      animate={{
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
      }}
      transition={transition}
      className="hidden h-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar md:flex"
    >
      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto",
          collapsed ? "items-stretch gap-1 py-3" : "gap-0.5 p-2"
        )}
      >
        {primaryNavItems.map(({ href, label, icon }) => {
          const moreSpecificMatch = primaryNavItems.some(
            (other) =>
              other.href !== href &&
              other.href.startsWith(href) &&
              pathname.startsWith(other.href)
          );
          const active =
            !moreSpecificMatch &&
            (pathname === href || (href !== "/" && pathname.startsWith(href)));

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex min-h-11 select-none no-underline outline-none transition-colors duration-200 hover:no-underline focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
                collapsed
                  ? "mx-auto w-14 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5"
                  : "w-full flex-row items-center gap-3 rounded-xl px-3 py-2.5",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <span className="flex shrink-0 items-center justify-center">
                <SidebarNavIcon icon={icon} active={active} />
              </span>
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap",
                  collapsed
                    ? "max-w-full text-center text-[10px] leading-tight tracking-tighter text-ellipsis"
                    : "text-sm",
                  active && "font-medium"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
