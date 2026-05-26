"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Hash } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { formatViews } from "@/lib/format";
import { Avatar } from "@/components/ui/user-avatar";
import { SubscribeButton } from "@/components/channel/SubscribeButton";
import { VideoActionBar } from "@/components/video/VideoActionBar";
import { cn } from "@/lib/utils";
import {
  PREMIUM_EASE,
  PREMIUM_SPRING_HOVER,
  PREMIUM_SPRING_PRESS,
} from "@/components/video/motion-presets";

const tagListVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.06 },
  },
};

const tagItemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: PREMIUM_EASE },
  },
};

const tagPressVariants = {
  hover: {
    scale: 1.03,
    transition: PREMIUM_SPRING_HOVER,
  },
  tap: {
    scale: 0.97,
    transition: PREMIUM_SPRING_PRESS,
  },
};

const tagChipClassName = cn(
  "group inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-pill border border-border/80 bg-surface-soft px-3 py-1.5",
  "text-sm font-medium text-secondary-foreground shadow-sm",
  "transition-[border-color,background-color,color,box-shadow] duration-200",
  "hover:border-primary/35 hover:bg-primary/10 hover:text-primary hover:shadow-md",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
);

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
  const reducedMotion = useReducedMotion();
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
        <nav
          className="mt-3 border-t border-hairline/60 pt-3"
          aria-label="Video topics"
        >
          {reducedMotion ? (
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag} className="max-w-full">
                  <Link
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className={tagChipClassName}
                    aria-label={`Search for ${tag}`}
                  >
                    <Hash
                      className="size-3.5 shrink-0 opacity-60"
                      aria-hidden
                    />
                    <span className="truncate">{tag}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <motion.ul
              className="flex flex-wrap gap-2"
              variants={tagListVariants}
              initial="hidden"
              animate="visible"
            >
              {tags.map((tag) => (
                <motion.li
                  key={tag}
                  variants={tagItemVariants}
                  className="max-w-full"
                >
                  <motion.div
                    variants={tagPressVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="inline-flex max-w-full"
                  >
                    <Link
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className={tagChipClassName}
                      aria-label={`Search for ${tag}`}
                    >
                      <Hash
                        className="size-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
                        aria-hidden
                      />
                      <span className="truncate">{tag}</span>
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </nav>
      )}
    </section>
  );
}
