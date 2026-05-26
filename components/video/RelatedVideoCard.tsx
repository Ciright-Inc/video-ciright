"use client";

import { NavLink } from "@/components/layout/NavLink";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion, useReducedMotion } from "motion/react";
import { formatDuration, formatViews } from "@/lib/format";
import type { VideoListItem } from "@/lib/data/videos";
import {
  cardArticleVariants,
  cardTextVariants,
  cardThumbVariants,
} from "./motion-presets";

interface RelatedVideoCardProps {
  video: VideoListItem;
  /** When set, used for the time line instead of the video's publish date */
  contextDate?: string | Date;
}

export function RelatedVideoCard({ video, contextDate }: RelatedVideoCardProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <article className="group flex gap-2">
        <CardContent video={video} contextDate={contextDate} />
      </article>
    );
  }

  return (
    <motion.article
      className="group flex gap-2 rounded-[var(--radius-md)] transition-[background-color,box-shadow] duration-500 ease-out hover:bg-surface-soft/60"
      variants={cardArticleVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <CardContent video={video} contextDate={contextDate} animated />
    </motion.article>
  );
}

function CardContent({
  video,
  contextDate,
  animated = false,
}: {
  video: VideoListItem;
  contextDate?: string | Date;
  animated?: boolean;
}) {
  const Thumb = animated ? motion.div : "div";
  const TextBlock = animated ? motion.div : "div";

  const thumbProps = animated
    ? { variants: cardThumbVariants }
    : {};
  const textProps = animated ? { variants: cardTextVariants } : {};

  return (
    <>
      <NavLink
        href={`/watch/${video.id}`}
        className="relative block w-[168px] shrink-0 overflow-hidden rounded-[var(--radius-md)]"
      >
        <Thumb className="relative aspect-video bg-surface-strong" {...thumbProps}>
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt=""
              fill
              className="object-cover"
              sizes="168px"
              unoptimized
            />
          )}
          {video.duration != null && (
            <span className="absolute bottom-1 right-1 rounded-[var(--radius-xs)] bg-surface-dark/90 px-1 py-0.5 text-[11px] font-medium tabular-nums text-on-dark">
              {formatDuration(video.duration)}
            </span>
          )}
        </Thumb>
      </NavLink>

      <TextBlock className="relative min-w-0 flex-1" {...textProps}>
        <NavLink href={`/watch/${video.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink transition-colors duration-300 group-hover:text-primary">
            {video.title}
          </h3>
        </NavLink>
        <NavLink
          href={`/channel/${video.channel.id}`}
          className="mt-1 block truncate text-xs text-secondary-foreground transition-colors duration-300 hover:text-primary"
        >
          {video.channel.name}
        </NavLink>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {formatViews(video.views)} ·{" "}
          {formatDistanceToNow(new Date(contextDate ?? video.createdAt), {
            addSuffix: true,
          })}
        </p>
      </TextBlock>
    </>
  );
}
