"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { formatViews } from "@/lib/format";
import { Avatar } from "@/components/ui/user-avatar";
import { SubscribeButton } from "@/components/channel/SubscribeButton";
import { VideoActionBar } from "@/components/video/VideoActionBar";

interface VideoInfoProps {
  videoId: string;
  title: string;
  description?: string | null;
  views: number;
  createdAt: Date;
  channel: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string | null;
    _count: { subscribers: number };
  };
  likeCount: number;
  dislikeCount: number;
  userLikeValue: number;
  isSubscribed: boolean;
  isOwner: boolean;
}

export function VideoInfo({
  videoId,
  title,
  description,
  views,
  createdAt,
  channel,
  likeCount,
  dislikeCount,
  userLikeValue,
  isSubscribed,
  isOwner,
}: VideoInfoProps) {
  const [expanded, setExpanded] = useState(false);
  const uploadedAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const showToggle = description && description.length > 120;

  return (
    <section className="flex flex-col">
      <h1 className="mt-3 text-xl font-semibold leading-snug text-ink">{title}</h1>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/channel/${channel.id}`} className="shrink-0">
            <Avatar src={channel.avatarUrl} name={channel.name} size="lg" />
          </Link>
          <div className="min-w-0">
            <Link
              href={`/channel/${channel.id}`}
              className="block truncate font-semibold text-ink hover:text-primary"
            >
              {channel.name}
            </Link>
            <p className="text-xs text-muted">
              {channel._count.subscribers.toLocaleString()} subscribers
            </p>
          </div>
          {!isOwner && (
            <SubscribeButton
              channelId={channel.id}
              initialSubscribed={isSubscribed}
            />
          )}
        </div>

        <VideoActionBar
          videoId={videoId}
          likeCount={likeCount}
          dislikeCount={dislikeCount}
          userLikeValue={userLikeValue}
        />
      </div>

      <div className="mt-3 rounded-[var(--radius-lg)] bg-surface-soft px-3 py-3">
        <button
          type="button"
          onClick={() => showToggle && setExpanded(!expanded)}
          className="w-full text-left"
          aria-expanded={expanded}
        >
          <p className="text-sm font-medium text-ink">
            {formatViews(views)} · {uploadedAgo}
          </p>
          {description && (
            <p
              className={`mt-2 whitespace-pre-wrap text-sm text-body ${
                expanded ? "" : "line-clamp-2"
              }`}
            >
              {description}
              {showToggle && !expanded && (
                <span className="font-medium text-ink"> …more</span>
              )}
            </p>
          )}
        </button>
        {showToggle && expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-1 text-sm font-medium text-ink hover:text-primary"
          >
            Show less
          </button>
        )}
      </div>
    </section>
  );
}
