"use client";

import Link from "next/link";
import { Compass, Search, SearchX } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { pillCtaLinkClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PREMIUM_SPRING_GENTLE, SMOOTH_EASE } from "@/components/video/motion-presets";

const emptyVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.5, ease: SMOOTH_EASE },
      y: PREMIUM_SPRING_GENTLE,
    },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      opacity: { duration: 0.45, ease: SMOOTH_EASE },
      scale: PREMIUM_SPRING_GENTLE,
      delay: 0.06,
    },
  },
};

export type SearchEmptyStateProps =
  | { variant: "idle" }
  | { variant: "no-results"; query: string };

export function SearchEmptyState(props: SearchEmptyStateProps) {
  const reducedMotion = useReducedMotion();
  const isIdle = props.variant === "idle";
  const Icon = isIdle ? Search : SearchX;

  const title = isIdle ? "Search for videos" : "No results found";
  const description = isIdle ? (
    <>
      <span className="md:hidden">
        Type a keyword in the search box above to discover videos by title or
        channel.
      </span>
      <span className="hidden md:inline">
        Enter a search term in the top bar to find videos by title, channel, or
        topic.
      </span>
    </>
  ) : (
    <>
      Nothing matched &quot;{props.query}&quot;. Try different keywords, fewer
      words, or check your spelling.
    </>
  );

  const iconCircle = (
    <>
      <span className="absolute inset-0 rounded-full bg-primary/5" />
      <Icon className="relative size-10 text-muted-foreground" strokeWidth={1.5} />
    </>
  );

  const iconClassName =
    "relative mb-6 flex size-20 items-center justify-center rounded-full bg-surface-soft ring-1 ring-hairline-soft";

  return (
    <motion.div
      initial={reducedMotion ? false : "hidden"}
      animate={reducedMotion ? undefined : "visible"}
      variants={reducedMotion ? undefined : emptyVariants}
      className="w-full"
    >
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-soft/40 px-6 py-14 text-center sm:py-16"
        role="status"
        aria-live="polite"
      >
        {reducedMotion ? (
          <div className={iconClassName} aria-hidden>
            {iconCircle}
          </div>
        ) : (
          <motion.div
            variants={iconVariants}
            className={iconClassName}
            aria-hidden
          >
            {iconCircle}
          </motion.div>
        )}
        <h2 className="mb-2 text-xl font-semibold text-ink">{title}</h2>
        <p className="max-w-md text-sm leading-relaxed text-secondary-foreground">
          {description}
        </p>
        {!isIdle ? (
          <Link href="/" className={cn(pillCtaLinkClass, "mt-6")}>
            <Compass className="size-4 text-primary" aria-hidden />
            Browse videos
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}
