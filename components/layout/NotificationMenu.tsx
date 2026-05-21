"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationButton } from "@/components/layout/NotificationButton";
import {
  NotificationListItem,
  type NotificationListItemData,
} from "@/components/layout/NotificationListItem";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const POLL_MS = 60_000;

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationListItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
    setLoading(true);
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
  }, []);

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
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
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
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <NotificationButton
        unreadCount={unreadCount}
        aria-expanded={open}
        onClick={handleToggle}
      />

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-surface-card font-[Roboto,sans-serif] shadow-[0_4px_32px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold text-ink">Notifications</h2>
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-text-link"
                onClick={() => void markAllRead()}
              >
                Mark all as read
              </Button>
            )}
          </div>

          <div className="max-h-[min(420px,70dvh)] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex justify-center py-12">
                <Spinner className="size-6" />
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                No notifications yet
              </p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <NotificationListItem
                      item={item}
                      onNavigate={() => setOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
