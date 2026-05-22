"use client";

import { motion, useReducedMotion } from "motion/react";
import { RelatedVideoCard } from "./RelatedVideoCard";
import type { VideoListItem } from "@/lib/data/videos";
import { cn } from "@/lib/utils";
import {
  listItemVariants,
  listVariants,
  PREMIUM_VIEWPORT,
} from "./motion-presets";

export type RelatedVideoListItem = {
  video: VideoListItem;
  contextDate?: string | Date;
  key?: string;
};

interface RelatedVideoListProps {
  videos?: VideoListItem[];
  items?: RelatedVideoListItem[];
  className?: string;
  /** Extra delay before the first item animates (e.g. staggered history sections) */
  entranceDelay?: number;
}

export function RelatedVideoList({
  videos,
  items: itemsProp,
  className,
  entranceDelay = 0,
}: RelatedVideoListProps) {
  const reducedMotion = useReducedMotion();

  const items: RelatedVideoListItem[] =
    itemsProp ??
    (videos ?? []).map((video) => ({
      video,
      key: video.id,
    }));

  const containerVariants = {
    hidden: listVariants.hidden,
    visible: {
      ...listVariants.visible,
      transition: {
        ...listVariants.visible.transition,
        delayChildren:
          listVariants.visible.transition.delayChildren + entranceDelay,
      },
    },
  };

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No related videos yet.
      </p>
    );
  }

  if (reducedMotion) {
    return (
      <ul className={cn("flex flex-col gap-2", className)}>
        {items.map((item) => (
          <li key={item.key ?? item.video.id}>
            <RelatedVideoCard
              video={item.video}
              contextDate={item.contextDate}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <motion.ul
      className={cn("flex flex-col gap-2", className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={PREMIUM_VIEWPORT}
    >
      {items.map((item) => (
        <motion.li
          key={item.key ?? item.video.id}
          variants={listItemVariants}
        >
          <RelatedVideoCard
            video={item.video}
            contextDate={item.contextDate}
          />
        </motion.li>
      ))}
    </motion.ul>
  );
}
