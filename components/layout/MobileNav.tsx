"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Compass, History, Home, Layers, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_NAV_INDICATOR_ID = "mobile-nav-active";

const indicatorTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 35,
};

export function MobileNav() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-14 items-center justify-evenly px-2">
        <NavItem
          href="/"
          label="Home"
          icon={Home}
          active={pathname === "/"}
          reducedMotion={reducedMotion}
        />
        <NavItem
          href="/search"
          label="Explore"
          icon={Compass}
          active={pathname.startsWith("/search")}
          reducedMotion={reducedMotion}
        />
        <NavItem
          href="/profile/history"
          label="History"
          icon={History}
          active={pathname === "/profile/history"}
          reducedMotion={reducedMotion}
        />
        <NavItem
          href="/subscriptions"
          label="Subscriptions"
          icon={Layers}
          active={pathname.startsWith("/subscriptions")}
          reducedMotion={reducedMotion}
        />
        <NavItem
          href="/profile"
          label="Profile"
          icon={User}
          active={pathname === "/profile" || (pathname.startsWith("/profile") && pathname !== "/profile/history")}
          reducedMotion={reducedMotion}
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  reducedMotion,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  reducedMotion: boolean | null;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 w-16 flex-col items-center justify-center gap-1 px-2 py-1.5 no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        active ? "text-primary" : "text-primary/60 hover:text-primary"
      )}
    >
      {active && (
        <motion.div
          layoutId={MOBILE_NAV_INDICATOR_ID}
          className="absolute inset-0 rounded-md bg-primary/10"
          transition={
            reducedMotion ? { duration: 0 } : indicatorTransition
          }
        />
      )}
      <Icon
        aria-hidden
        className="relative z-10 size-5"
        strokeWidth={active ? 2.5 : 2}
      />
      <span
        className={cn(
          "relative z-10 text-[10px] font-medium leading-none",
          active && "font-semibold"
        )}
      >
        {label}
      </span>
    </Link>
  );
}
