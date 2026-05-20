"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { BarChart3, LogOut, Tv } from "lucide-react";
import { Avatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

export function AvatarMenu({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const channelId = session.user.channelId;
  const channelHref = channelId ? `/channel/${channelId}` : undefined;

  return (
    <div ref={rootRef} className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex size-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <Avatar
          src={session.user.image}
          name={session.user.name}
          size="md"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border border-border bg-surface-card py-1 shadow-lg"
        >
          {channelHref && (
            <Link
              role="menuitem"
              href={channelHref}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink no-underline hover:bg-muted/60"
              onClick={() => setOpen(false)}
            >
              <Tv className="size-4 shrink-0 text-muted-foreground" />
              Your channel
            </Link>
          )}
          <Link
            role="menuitem"
            href="/profile"
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink no-underline hover:bg-muted/60"
            onClick={() => setOpen(false)}
          >
            <BarChart3 className="size-4 shrink-0 text-muted-foreground" />
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-ink hover:bg-muted/60"
            onClick={() => {
              setOpen(false);
              void signOut({ callbackUrl: "/" });
            }}
          >
            <LogOut className="size-4 shrink-0 text-muted-foreground" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
