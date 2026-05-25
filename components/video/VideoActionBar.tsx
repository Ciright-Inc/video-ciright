"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LikeButtons } from "./LikeButtons";
import { SaveButton } from "./SaveButton";
import { ShareMenu } from "./ShareMenu";

interface VideoActionBarProps {
  videoId: string;
  title: string;
  likeCount: number;
  dislikeCount: number;
  userLikeValue: number;
  initialSaved: boolean;
}

export function VideoActionBar({
  videoId,
  title,
  likeCount,
  dislikeCount,
  userLikeValue,
  initialSaved,
}: VideoActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <LikeButtons
        videoId={videoId}
        initialLikeCount={likeCount}
        initialDislikeCount={dislikeCount}
        initialUserValue={userLikeValue}
      />
      <ShareMenu videoId={videoId} title={title} />
      <SaveButton videoId={videoId} initialSaved={initialSaved} />
      <ActionPill label="More actions" icon={<MoreIcon />} iconOnly />
    </div>
  );
}

function ActionPill({
  label,
  icon,
  iconOnly,
  onClick,
  disabled,
}: {
  label: string;
  icon: ReactNode;
  iconOnly?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const compact = iconOnly;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={compact ? label : undefined}
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center bg-surface-soft text-sm font-medium text-ink transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
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

function MoreIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}
