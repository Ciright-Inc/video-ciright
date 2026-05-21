"use client";

import { Bell } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const bellHover = {
  rotate: [0, -14, 14, -10, 10, -4, 0],
  transition: { duration: 0.55, ease: "easeInOut" as const },
};

const badgeSpring = {
  type: "spring" as const,
  stiffness: 520,
  damping: 28,
};

type NotificationButtonProps = {
  unreadCount?: number;
  className?: string;
  onClick?: () => void;
  "aria-expanded"?: boolean;
};

export function NotificationButton({
  unreadCount = 0,
  className,
  onClick,
  "aria-expanded": ariaExpanded,
}: NotificationButtonProps) {
  const reducedMotion = useReducedMotion();
  const hasUnread = unreadCount > 0;
  const badgeLabel =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : undefined;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-haspopup="menu"
      aria-label={
        hasUnread
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
      className={cn(
        "group/notif relative size-10 shrink-0 rounded-full border border-transparent",
        "bg-transparent shadow-none",
        "hover:border-border/70 hover:bg-muted/90 hover:shadow-[0_1px_0_rgba(0,0,0,0.04)]",
        "focus-visible:border-primary/25 focus-visible:ring-primary/25",
        "dark:hover:bg-muted/45 dark:hover:shadow-none",
        "active:scale-[0.97] active:transition-transform active:duration-150",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-primary/0 transition-colors duration-200 group-hover/notif:bg-primary/[0.06] group-focus-visible/notif:bg-primary/[0.08]"
      />

      <motion.span
        aria-hidden
        className="absolute inset-0 z-10 flex items-center justify-center rounded-full"
        initial={false}
        whileHover={reducedMotion ? undefined : bellHover}
      >
        <Bell
          className={cn(
            "size-[22px] transition-colors duration-200",
            hasUnread
              ? "text-foreground"
              : "text-muted-foreground group-hover/notif:text-foreground"
          )}
          strokeWidth={hasUnread ? 2.25 : 2}
        />
      </motion.span>

      <AnimatePresence>
        {hasUnread && (
          <motion.span
            key="badge"
            initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reducedMotion ? undefined : { scale: 0, opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : badgeSpring}
            className={cn(
              "absolute z-20 flex min-w-[18px] items-center justify-center rounded-full",
              "border-2 border-background bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground",
              "shadow-[0_0_0_1px_rgba(0,0,0,0.06)]",
              unreadCount > 9 ? "right-0 top-0 h-[18px]" : "right-0.5 top-0.5 size-[18px]"
            )}
          >
            {badgeLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
