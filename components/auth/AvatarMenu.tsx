"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import {
  BarChart3,
  History,
  LogOut,
  Settings,
  User,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

function MenuDivider() {
  return <div className="my-1.5 h-px bg-border" role="separator" />;
}

function MenuRow({
  href,
  onClick,
  icon: Icon,
  children,
  className,
}: {
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  const rowClass = cn(
    "flex min-h-10 w-full items-center gap-3 px-4 py-2 text-left text-sm text-ink no-underline transition-colors hover:bg-foreground/6",
    className
  );
  const content = (
    <>
      {Icon ? (
        <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      ) : null}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link role="menuitem" href={href} className={rowClass} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" className={rowClass} onClick={onClick}>
      {content}
    </button>
  );
}

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
  const displayName = session.user.name?.trim() || "Account";
  const subtitle =
    session.user.channelHandle != null && session.user.channelHandle !== ""
      ? `@${session.user.channelHandle}`
      : session.user.email;

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
          className="absolute right-0 top-full z-50 mt-2 w-[300px] overflow-hidden rounded-xl border border-border bg-surface-card font-[Roboto,sans-serif] shadow-[0_4px_32px_rgba(0,0,0,0.12)]"
        >
          <div id="sections" className="py-2">
            <section className="px-4 pb-1 pt-1">
              <div className="flex items-center gap-3">
                <Avatar
                  src={session.user.image}
                  name={session.user.name}
                  size="lg"
                  className="size-10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {subtitle}
                  </p>
                </div>
              </div>
              {channelHref && (
                <Link
                  href={channelHref}
                  onClick={() => setOpen(false)}
                  className="mt-3 flex h-9 w-full items-center justify-center rounded-full border border-border bg-transparent text-sm font-medium text-ink no-underline transition-colors hover:bg-foreground/6"
                >
                  View your channel
                </Link>
              )}
            </section>

            <MenuDivider />

            <section>
              <MenuRow
                href="/profile/history"
                icon={History}
                onClick={() => setOpen(false)}
              >
                Watch history
              </MenuRow>
              <MenuRow
                href="/profile"
                icon={User}
                onClick={() => setOpen(false)}
              >
                Profile
              </MenuRow>
              <MenuRow
                href="/profile/content"
                icon={Video}
                onClick={() => setOpen(false)}
              >
                Your videos
              </MenuRow>
              <MenuRow
                href="/profile/channel"
                icon={Settings}
                onClick={() => setOpen(false)}
              >
                Channel settings
              </MenuRow>
            </section>

            <MenuDivider />

            <section>
              <MenuRow
                href="/profile/analytics"
                icon={BarChart3}
                onClick={() => setOpen(false)}
              >
                Analytics
              </MenuRow>
            </section>

            <MenuDivider />

            <section>
              <MenuRow
                icon={LogOut}
                onClick={() => {
                  setOpen(false);
                  void signOut({ callbackUrl: "/" });
                }}
              >
                Sign out
              </MenuRow>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
