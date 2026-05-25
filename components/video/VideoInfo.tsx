"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { formatViews } from "@/lib/format";
import { Avatar } from "@/components/ui/user-avatar";
import { SubscribeButton } from "@/components/channel/SubscribeButton";
import { Badge } from "@/components/ui/badge";
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
  isSaved: boolean;
  isSubscribed: boolean;
  isOwner: boolean;
  tags?: string[];
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
  isSaved,
  isSubscribed,
  isOwner,
  tags = [],
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
              className="block truncate font-semibold text-primary hover:text-primary-hover"
            >
              {channel.name}
            </Link>
            <p className="text-xs text-secondary-foreground">
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
          title={title}
          likeCount={likeCount}
          dislikeCount={dislikeCount}
          userLikeValue={userLikeValue}
          initialSaved={isSaved}
        />
      </div>

      <div className="mt-3 rounded-[var(--radius-lg)] bg-surface-soft px-3 py-3">
        <button
          type="button"
          onClick={() => showToggle && setExpanded(!expanded)}
          className="w-full text-left"
          aria-expanded={expanded}
        >
          <p className="text-sm font-medium text-secondary-foreground">
            {formatViews(views)} · {uploadedAgo}
          </p>
          {description && (
            <p
              className={`mt-2 whitespace-pre-wrap text-sm text-secondary-foreground ${
                expanded ? "" : "line-clamp-2"
              }`}
            >
              {description}
              {showToggle && !expanded && (
                <span className="font-medium text-primary"> …more</span>
              )}
            </p>
          )}
        </button>
        {showToggle && expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-1 text-sm font-medium text-primary hover:text-primary-hover"
          >
            Show less
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="shrink-0"
            >
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/15"
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
