"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchProfileTab } from "@/lib/queries/profile-tab-cache";
import { NavLink } from "@/components/layout/NavLink";
import {
  isNavigationPending,
  normalizeAppHref,
  useNavigationPending,
} from "@/components/providers/NavigationPendingProvider";
import { motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  Bookmark,
  Clapperboard,
  History,
  LayoutDashboard,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const indicatorTransition = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.85,
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
  { href: "/profile/saved", label: "Saved", icon: Bookmark },
  { href: "/profile/channel", label: "Channel", icon: Tv },
];

type IndicatorRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function isTabActive(pathname: string, tab: ProfileTab) {
  return tab.exact
    ? pathname === tab.href
    : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
}

function useSlidingTabIndicator(
  navRef: RefObject<HTMLElement | null>,
  tabRefs: RefObject<Map<string, HTMLElement>>,
  activeHref: string | undefined,
  reducedMotion: boolean | null
) {
  const [rect, setRect] = useState<IndicatorRect | null>(null);
  const [canAnimate, setCanAnimate] = useState(false);

  const measure = useCallback(() => {
    const nav = navRef.current;
    if (!nav || !activeHref) {
      setRect(null);
      return;
    }

    const tab = tabRefs.current.get(activeHref);
    if (!tab) {
      setRect(null);
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();

    setRect({
      left: tabRect.left - navRect.left + nav.scrollLeft,
      top: tabRect.top - navRect.top + nav.scrollTop,
      width: tabRect.width,
      height: tabRect.height,
    });
  }, [activeHref, navRef, tabRefs]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    for (const tab of tabRefs.current.values()) {
      ro.observe(tab);
    }

    nav.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      nav.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [activeHref, measure, navRef, tabRefs]);

  useLayoutEffect(() => {
    if (!rect) return;
    const id = requestAnimationFrame(() => setCanAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [rect]);

  const transition =
    reducedMotion || !canAnimate ? { duration: 0 } : indicatorTransition;

  return { rect, transition, measure };
}

export function ProfileTabs() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Map<string, HTMLElement>>(new Map());

  const activeHref = useMemo(
    () => tabs.find((tab) => isTabActive(pathname, tab))?.href,
    [pathname]
  );

  const registerTab = useCallback((href: string, node: HTMLElement | null) => {
    if (node) tabRefs.current.set(href, node);
    else tabRefs.current.delete(href);
  }, []);

  const { rect, transition, measure } = useSlidingTabIndicator(
    navRef,
    tabRefs,
    activeHref,
    reducedMotion
  );

  useLayoutEffect(() => {
    if (!activeHref || !navRef.current) return;
    const tab = tabRefs.current.get(activeHref);
    tab?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
    measure();
  }, [activeHref, measure, reducedMotion]);

  return (
    <div className="relative -mx-4 mb-6 min-w-0 sm:mx-0">
      <nav
        ref={navRef}
        aria-label="Creator hub sections"
        className={cn(
          "relative flex min-w-0 gap-1.5 overflow-x-auto overscroll-x-contain py-1 scrollbar-none",
          "scroll-smooth scroll-px-4 px-4",
          "max-sm:snap-x max-sm:snap-mandatory",
          "sm:gap-2 sm:scroll-px-0 sm:px-0"
        )}
      >
        {rect ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute z-0 rounded-full bg-primary"
            initial={false}
            animate={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              opacity: 1,
            }}
            transition={transition}
          />
        ) : null}

        {tabs.map((tab) => (
          <ProfileTabChip
            key={tab.href}
            tab={tab}
            active={isTabActive(pathname, tab)}
            registerTab={registerTab}
          />
        ))}
      </nav>
    </div>
  );
}

const CACHED_PROFILE_TAB_HREFS = new Set([
  "/profile",
  "/profile/history",
  "/profile/saved",
  "/profile/channel",
]);

function ProfileTabChip({
  tab,
  active,
  registerTab,
}: {
  tab: ProfileTab;
  active: boolean;
  registerTab: (href: string, node: HTMLElement | null) => void;
}) {
  const Icon = tab.icon;
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { pendingHref } = useNavigationPending();
  const pending =
    !active &&
    pendingHref !== null &&
    isNavigationPending(pendingHref, pathname) &&
    normalizeAppHref(pendingHref).split("?")[0] === tab.href;

  const prefetchTab = useCallback(() => {
    if (!CACHED_PROFILE_TAB_HREFS.has(tab.href)) return;
    prefetchProfileTab(queryClient, tab.href);
  }, [queryClient, tab.href]);

  return (
    <NavLink
      ref={(node) => registerTab(tab.href, node)}
      href={tab.href}
      onMouseEnter={prefetchTab}
      onFocus={prefetchTab}
      aria-current={active ? "page" : undefined}
      aria-busy={pending || undefined}
      title={tab.label}
      className={cn(
        "relative z-10 inline-flex shrink-0 snap-start items-center justify-center rounded-full no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "size-11 gap-0 sm:h-8 sm:w-auto sm:gap-1.5 sm:px-3.5",
        "text-sm font-medium",
        active
          ? "text-primary-foreground!"
          : "bg-muted text-secondary-foreground hover:bg-surface-soft hover:text-primary",
        pending && "opacity-70"
      )}
    >
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
    </NavLink>
  );
}
