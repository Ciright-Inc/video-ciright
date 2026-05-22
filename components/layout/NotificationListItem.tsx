"use client";

import Image from "next/image";
import Link from "next/link";
import type { NotificationType } from "@prisma/client";
import {
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
  Video,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { RelativeTime } from "@/components/ui/relative-time";
import { Avatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

const iconByType: Record<NotificationType, LucideIcon> = {
  VIDEO_LIKE: ThumbsUp,
  VIDEO_DISLIKE: ThumbsDown,
  COMMENT_LIKE: ThumbsUp,
  COMMENT_DISLIKE: ThumbsDown,
  COMMENT_REPLY: MessageCircle,
  SUBSCRIPTION_NEW_VIDEO: Video,
  CHANNEL_NEW_SUBSCRIBER: UserPlus,
};

const iconBadgeClassByType: Partial<Record<NotificationType, string>> = {
  VIDEO_LIKE: "bg-emerald-600 text-white",
  COMMENT_LIKE: "bg-emerald-600 text-white",
  VIDEO_DISLIKE: "bg-destructive text-white",
  COMMENT_DISLIKE: "bg-destructive text-white",
  COMMENT_REPLY: "bg-primary text-primary-foreground",
  SUBSCRIPTION_NEW_VIDEO: "bg-primary text-primary-foreground",
  CHANNEL_NEW_SUBSCRIBER: "bg-primary text-primary-foreground",
};

const rowSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 30,
  mass: 0.78,
};

const popSpring = {
  type: "spring" as const,
  stiffness: 560,
  damping: 22,
};

const easeOut = [0.23, 1, 0.32, 1] as const;

/** Stagger container for the notification list (menu panel). */
export const notificationListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15, ease: easeOut },
  },
};

export type NotificationListItemData = {
  id: string;
  type: NotificationType;
  title: string;
  href: string;
  thumbnailUrl: string | null;
  read: boolean;
  updatedAt: string;
  latestActor: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

function NotificationTitle({ title, actorName }: { title: string; actorName?: string | null }) {
  const actor = actorName?.trim();
  if (actor && title.startsWith(actor)) {
    return (
      <p className="line-clamp-2 text-sm leading-snug text-ink">
        <span className="font-medium">{actor}</span>
        {title.slice(actor.length)}
      </p>
    );
  }
  return (
    <p className="line-clamp-2 text-sm leading-snug text-ink">{title}</p>
  );
}

export function NotificationListItem({
  item,
  index = 0,
  onNavigate,
}: {
  item: NotificationListItemData;
  /** Row index for staggered entrance on each panel open. */
  index?: number;
  onNavigate?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const Icon = iconByType[item.type];
  const badgeClass =
    iconBadgeClassByType[item.type] ?? "bg-muted text-muted-foreground";

  const baseDelay = reducedMotion ? 0 : 0.1 + index * 0.048;

  return (
    <li className="overflow-hidden">
      <MotionLink
        href={item.href}
        role="menuitem"
        onClick={onNavigate}
        initial={reducedMotion ? false : { opacity: 0, x: 20, scale: 0.988 }}
        animate={reducedMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
        transition={{ ...rowSpring, delay: baseDelay }}
        whileHover={
          reducedMotion
            ? undefined
            : { x: 3, transition: { duration: 0.2, ease: easeOut } }
        }
        whileTap={
          reducedMotion
            ? undefined
            : { scale: 0.992, transition: { duration: 0.1 } }
        }
        className={cn(
          "group/item relative flex min-h-[52px] gap-3 px-4 py-3 text-left no-underline",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset",
          item.read
            ? "bg-transparent hover:bg-foreground/5"
            : "bg-white hover:bg-zinc-50 dark:bg-white/95 dark:hover:bg-white"
        )}
      >
        {!item.read && (
          <motion.span
            aria-hidden
            className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full bg-primary"
            style={{ originY: 0.5 }}
            initial={reducedMotion ? false : { scaleY: 0, opacity: 0 }}
            animate={reducedMotion ? undefined : { scaleY: 1, opacity: 1 }}
            transition={{ ...popSpring, delay: baseDelay + 0.02 }}
          />
        )}

        <motion.div
          className="relative shrink-0 self-start"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.78, rotate: -10 }}
          animate={reducedMotion ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
          transition={{ ...popSpring, delay: baseDelay + 0.05 }}
          whileHover={
            reducedMotion ? undefined : { scale: 1.07, rotate: 2, transition: popSpring }
          }
        >
          {item.latestActor ? (
            <Avatar
              src={item.latestActor.image}
              name={item.latestActor.name}
              size="md"
              className="size-10 ring-1 ring-border/60"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-muted ring-1 ring-border/40">
              <Icon className="size-5 text-muted-foreground" aria-hidden />
            </div>
          )}
          {item.latestActor && (
            <motion.span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full shadow-sm",
                badgeClass
              )}
              initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
              animate={reducedMotion ? undefined : { scale: 1, opacity: 1 }}
              transition={{ ...popSpring, delay: baseDelay + 0.1 }}
            >
              <Icon className="size-3" strokeWidth={2.5} aria-hidden />
            </motion.span>
          )}
        </motion.div>

        <motion.div
          className="min-w-0 flex-1 self-center"
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{
            duration: 0.36,
            ease: easeOut,
            delay: baseDelay + 0.07,
          }}
        >
          <NotificationTitle
            title={item.title}
            actorName={item.latestActor?.name}
          />
          <RelativeTime
            date={item.updatedAt}
            className="mt-1 block text-xs text-muted-foreground"
          />
        </motion.div>

        {item.thumbnailUrl ? (
          <motion.div
            className="relative aspect-video w-17 shrink-0 self-center overflow-hidden rounded-md bg-muted ring-1 ring-border/50"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.88, x: 12 }}
            animate={reducedMotion ? undefined : { opacity: 1, scale: 1, x: 0 }}
            transition={{ ...rowSpring, delay: baseDelay + 0.09 }}
            whileHover={
              reducedMotion
                ? undefined
                : { scale: 1.05, x: -2, transition: { duration: 0.22, ease: easeOut } }
            }
          >
            <Image
              src={item.thumbnailUrl}
              alt=""
              fill
              sizes="136px"
              unoptimized
              className="object-cover transition-transform duration-300 group-hover/item:scale-[1.03]"
            />
          </motion.div>
        ) : null}
      </MotionLink>
    </li>
  );
}
