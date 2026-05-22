"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { NotificationButton } from "@/components/layout/NotificationButton";
import {
  NotificationListItem,
  notificationListVariants,
  type NotificationListItemData,
} from "@/components/layout/NotificationListItem";
import { headerPopoverPanelClass } from "@/components/layout/header-popover-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POLL_MS = 60_000;

/** Dropdown from bell — weighted spring (popover preset, top-right origin). */
const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: -14 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 26,
      mass: 0.82,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const, delay: 0.04 },
  },
};

const contentSwapVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: "easeIn" as const },
  },
};

function NotificationSkeleton() {
  return (
    <div className="flex animate-pulse gap-3 px-4 py-3.5" aria-hidden>
      <div className="size-10 shrink-0 rounded-full bg-muted" />
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
        <div className="h-3.5 w-[88%] rounded-md bg-muted" />
        <div className="h-3 w-16 rounded-md bg-muted/80" />
      </div>
    </div>
  );
}

function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted/80 ring-1 ring-border/60">
        <Bell className="size-6 text-muted-foreground" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="text-sm font-medium text-ink">You&apos;re all caught up</p>
      <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-muted-foreground">
        Likes, replies, and channel updates will show up here.
      </p>
    </div>
  );
}

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  /** Bumped on each open so list entrance animations replay every time. */
  const [openEpoch, setOpenEpoch] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationListItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.count ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(items.length === 0);
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [items.length]);

  useEffect(() => {
    const initial = window.setTimeout(() => void fetchUnreadCount(), 0);
    const id = window.setInterval(() => void fetchUnreadCount(), POLL_MS);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(id);
    };
  }, [fetchUnreadCount]);

  function handleToggle() {
    setOpen((wasOpen) => {
      const next = !wasOpen;
      if (next) {
        setOpenEpoch((e) => e + 1);
        void fetchNotifications();
        void fetchUnreadCount();
      }
      return next;
    });
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function markAllRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) return;
      setUnreadCount(0);
      setItems([]);
    } catch {
      /* ignore */
    }
  }

  async function markItemRead(id: string) {
    const item = items.find((n) => n.id === id);
    if (!item || item.read) return;
    setItems((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
    } catch {
      if (item) setItems((prev) => [...prev, item]);
      void fetchUnreadCount();
    }
  }

  function handleItemNavigate(id: string) {
    void markItemRead(id);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <NotificationButton
        unreadCount={unreadCount}
        aria-expanded={open}
        onClick={handleToggle}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            key={openEpoch}
            role="menu"
            aria-label="Notifications"
            initial={reducedMotion ? false : "hidden"}
            animate="visible"
            exit="exit"
            variants={reducedMotion ? undefined : panelVariants}
            style={{ transformOrigin: "top right" }}
            className={cn(
              headerPopoverPanelClass,
              "w-[min(380px,calc(100vw-2rem))]"
            )}
          >
            <motion.div
              variants={reducedMotion ? undefined : headerVariants}
              initial={reducedMotion ? false : "hidden"}
              animate="visible"
              className="flex items-center gap-2 border-b border-border/80 bg-card px-4 py-3"
            >
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-primary">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <div className="flex-1" />
              {unreadCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs font-medium text-text-link hover:bg-primary/10 hover:text-text-link"
                  onClick={() => void markAllRead()}
                >
                  <CheckCheck className="size-3.5" aria-hidden />
                  Mark all read
                </Button>
              )}
            </motion.div>

            <div className="max-h-[min(440px,70dvh)] overflow-y-auto overscroll-contain bg-card">
              {loading && items.length === 0 ? (
                <motion.div
                  key="loading"
                  variants={reducedMotion ? undefined : contentSwapVariants}
                  initial={reducedMotion ? false : "hidden"}
                  animate="visible"
                  className="divide-y divide-border/60 py-1"
                >
                  {Array.from({ length: 4 }, (_, i) => (
                    <NotificationSkeleton key={i} />
                  ))}
                </motion.div>
              ) : items.length === 0 ? (
                <motion.div
                  key="empty"
                  variants={reducedMotion ? undefined : contentSwapVariants}
                  initial={reducedMotion ? false : "hidden"}
                  animate="visible"
                >
                  <NotificationEmptyState />
                </motion.div>
              ) : (
                <motion.ul
                  key={`list-${openEpoch}`}
                  role="presentation"
                  className="divide-y divide-border/60 bg-card"
                  variants={reducedMotion ? undefined : notificationListVariants}
                  initial={reducedMotion ? false : "hidden"}
                  animate="visible"
                >
                  {items.map((item, index) => (
                    <NotificationListItem
                      key={`${openEpoch}-${item.id}`}
                      item={item}
                      index={index}
                      onNavigate={() => handleItemNavigate(item.id)}
                    />
                  ))}
                </motion.ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
