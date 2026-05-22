"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  Clapperboard,
  History,
  LayoutDashboard,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROFILE_TABS_INDICATOR_ID = "profile-tabs-active";

const indicatorTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 35,
};

type ProfileTab = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const tabs: ProfileTab[] = [
  { href: "/profile", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/profile/content", label: "Content", icon: Clapperboard },
  { href: "/profile/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/profile/history", label: "History", icon: History },
  { href: "/profile/channel", label: "Channel", icon: Tv },
];

export function ProfileTabs() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <LayoutGroup id="profile-tabs">
      <div className="relative -mx-4 mb-6 min-w-0 sm:mx-0">
        <nav
          aria-label="Creator hub sections"
          className={cn(
            "flex min-w-0 gap-1.5 overflow-x-auto overscroll-x-contain py-1 scrollbar-none",
            "scroll-smooth scroll-px-4 px-4",
            "max-sm:snap-x max-sm:snap-mandatory",
            "sm:gap-2 sm:scroll-px-0 sm:px-0"
          )}
        >
          {tabs.map((tab) => {
            const active = tab.exact
              ? pathname === tab.href
              : pathname === tab.href ||
                pathname.startsWith(`${tab.href}/`);

            return (
              <ProfileTabChip
                key={tab.href}
                tab={tab}
                active={active}
                reducedMotion={reducedMotion}
              />
            );
          })}
        </nav>
      </div>
    </LayoutGroup>
  );
}

function ProfileTabChip({
  tab,
  active,
  reducedMotion,
}: {
  tab: ProfileTab;
  active: boolean;
  reducedMotion: boolean | null;
}) {
  const Icon = tab.icon;

  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      title={tab.label}
      className={cn(
        "relative inline-flex shrink-0 snap-start items-center justify-center rounded-full no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "size-11 gap-0 sm:h-8 sm:w-auto sm:gap-1.5 sm:px-3.5",
        "text-sm font-medium",
        active
          ? "text-primary-foreground!"
          : "bg-muted text-body hover:bg-surface-soft hover:text-ink"
      )}
    >
      {active && (
        <motion.div
          layoutId={PROFILE_TABS_INDICATOR_ID}
          className="absolute inset-0 rounded-full bg-primary"
          transition={reducedMotion ? { duration: 0 } : indicatorTransition}
        />
      )}
      <Icon
        className={cn(
          "relative z-10 size-4 shrink-0",
          active && "text-primary-foreground"
        )}
        aria-hidden
      />
      <span
        className={cn(
          "relative z-10 max-sm:sr-only",
          active && "font-semibold text-primary-foreground"
        )}
      >
        {tab.label}
      </span>
    </Link>
  );
}
