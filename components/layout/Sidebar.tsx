"use client";

import { NavLink } from "@/components/layout/NavLink";
import {
  isNavigationPending,
  normalizeAppHref,
  useNavigationPending,
} from "@/components/providers/NavigationPendingProvider";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { primaryNavItems } from "@/components/layout/nav-items";
import { SidebarNavIcon } from "@/components/layout/SidebarNavIcon";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/SidebarProvider";

const SIDEBAR_WIDTH_COLLAPSED = 72;
const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_NAV_INDICATOR_EXPANDED = "sidebar-nav-active-expanded";
const SIDEBAR_NAV_INDICATOR_COLLAPSED = "sidebar-nav-active-collapsed";

const sidebarTransition = {
  duration: 0.28,
  ease: [0.4, 0, 0.2, 1] as const,
};

const indicatorTransition = {
  duration: 0.2,
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
      className="hidden h-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex"
    >
      <LayoutGroup id="sidebar-nav">
        <nav
          className={cn(
            "sidebar-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto",
            collapsed ? "items-stretch gap-1 py-3" : "gap-1.5 py-2"
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
              (pathname === href ||
                (href !== "/" && pathname.startsWith(href)));

            return (
              <SidebarNavItem
                key={href}
                href={href}
                label={label}
                icon={icon}
                active={active}
                collapsed={collapsed}
                reducedMotion={reducedMotion}
              />
            );
          })}
        </nav>
      </LayoutGroup>
    </motion.aside>
  );
}

function SidebarNavItem({
  href,
  label,
  icon,
  active,
  collapsed,
  reducedMotion,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
  reducedMotion: boolean | null;
}) {
  const pathname = usePathname();
  const { pendingHref } = useNavigationPending();
  const pending =
    !active &&
    pendingHref !== null &&
    isNavigationPending(pendingHref, pathname) &&
    normalizeAppHref(pendingHref).split("?")[0] === href;

  return (
    <NavLink
      href={href}
      aria-current={active ? "page" : undefined}
      aria-busy={pending || undefined}
      className={cn(
        "group relative flex overflow-hidden select-none no-underline outline-none transition-colors duration-200 hover:no-underline focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
        collapsed
          ? "min-h-11 w-full max-w-full min-w-0 flex-col items-center justify-center gap-1 px-1 py-2.5"
          : "h-10 w-full max-w-full min-w-0 flex-row items-center gap-3 px-4 py-2",
        active
          ? "font-medium text-sidebar-foreground"
          : "text-on-dark-soft hover:bg-sidebar-accent hover:text-sidebar-foreground",
        pending && "opacity-60"
      )}
    >
      {active && (
        <motion.div
          layoutId={
            collapsed
              ? SIDEBAR_NAV_INDICATOR_COLLAPSED
              : SIDEBAR_NAV_INDICATOR_EXPANDED
          }
          className="absolute inset-y-0 left-0 right-0 border-l-2 border-sidebar-foreground bg-sidebar-active"
          transition={reducedMotion ? { duration: 0 } : indicatorTransition}
        />
      )}
      <span className="relative z-10 flex shrink-0 items-center justify-center">
        <SidebarNavIcon icon={icon} active={active} />
      </span>
      <span
        className={cn(
          "relative z-10 overflow-hidden whitespace-nowrap",
          collapsed
            ? "max-w-full text-center text-[10px] leading-tight tracking-tighter text-ellipsis"
            : "text-sm",
          active && "font-medium"
        )}
      >
        {label}
      </span>
    </NavLink>
  );
}
