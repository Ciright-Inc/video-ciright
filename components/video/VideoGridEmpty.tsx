"use client";

import Link from "next/link";
import { Film, Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button, pillCtaLinkClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PREMIUM_SPRING_GENTLE, SMOOTH_EASE } from "./motion-presets";

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

export interface VideoGridEmptyProps {
  title?: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void } | null;
}

export function VideoGridEmpty({
  title = "No videos found",
  description = "Upload your first video and it will appear here.",
  action = { label: "Upload video", href: "/upload" },
}: VideoGridEmptyProps) {
  const reducedMotion = useReducedMotion();

  const iconCircle = (
    <>
      <span className="absolute inset-0 rounded-full bg-primary/5" />
      <Film className="relative size-10 text-muted-foreground" strokeWidth={1.5} />
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
        <p className="max-w-sm text-sm leading-relaxed text-secondary-foreground">{description}</p>
        {action ? (
          action.onClick ? (
            <Button
              type="button"
              variant="outline"
              className={cn(pillCtaLinkClass, "mt-6")}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ) : action.href ? (
            <Link href={action.href} className={cn(pillCtaLinkClass, "mt-6")}>
              <Plus className="size-4 text-primary" aria-hidden />
              {action.label}
            </Link>
          ) : null
        ) : null}
      </div>
    </motion.div>
  );
}
