"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LikeButtons } from "./LikeButtons";

interface VideoActionBarProps {
  videoId: string;
  likeCount: number;
  dislikeCount: number;
  userLikeValue: number;
}

export function VideoActionBar({
  videoId,
  likeCount,
  dislikeCount,
  userLikeValue,
}: VideoActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <LikeButtons
        videoId={videoId}
        initialLikeCount={likeCount}
        initialDislikeCount={dislikeCount}
        initialUserValue={userLikeValue}
      />
      <ActionPill label="Share" icon={<ShareIcon />} />
      <ActionPill label="Save" icon={<SaveIcon />} />
      <ActionPill label="More actions" icon={<MoreIcon />} iconOnly />
    </div>
  );
}

function ActionPill({
  label,
  icon,
  iconOnly,
}: {
  label: string;
  icon: ReactNode;
  iconOnly?: boolean;
}) {
  const compact = iconOnly;

  return (
    <button
      type="button"
      aria-label={compact ? label : undefined}
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center bg-surface-soft text-sm font-medium text-ink transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        compact
          ? "size-10 rounded-full"
          : "gap-2 rounded-[var(--radius-pill)] px-3 py-2 max-sm:size-10 max-sm:rounded-full max-sm:p-0"
      )}
    >
      {icon}
      {!iconOnly && (
        <>
          <span className="sr-only sm:hidden">{label}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      )}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}
