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
      <nav
        aria-label="Creator hub sections"
        className="mb-6 flex gap-2 overflow-x-auto py-1 scrollbar-none"
      >
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

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
      className={cn(
        "relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "text-on-primary!"
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
          active && "text-on-primary"
        )}
        aria-hidden
      />
      <span
        className={cn(
          "relative z-10",
          active && "font-semibold text-on-primary"
        )}
      >
        {tab.label}
      </span>
    </Link>
  );
}
