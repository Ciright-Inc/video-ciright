import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { NotificationType } from "@prisma/client";
import {
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

const iconByType: Record<NotificationType, LucideIcon> = {
  VIDEO_LIKE: ThumbsUp,
  VIDEO_DISLIKE: ThumbsDown,
  COMMENT_LIKE: ThumbsUp,
  COMMENT_DISLIKE: ThumbsDown,
  COMMENT_REPLY: MessageCircle,
  SUBSCRIPTION_NEW_VIDEO: Video,
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

export function NotificationListItem({
  item,
  onNavigate,
}: {
  item: NotificationListItemData;
  onNavigate?: () => void;
}) {
  const Icon = iconByType[item.type];

  return (
    <Link
      href={item.href}
      role="menuitem"
      onClick={onNavigate}
      className={cn(
        "flex gap-3 px-4 py-3 text-left no-underline transition-colors hover:bg-foreground/6",
        !item.read && "bg-primary/[0.04]"
      )}
    >
      <div className="relative shrink-0">
        {item.latestActor ? (
          <Avatar
            src={item.latestActor.image}
            name={item.latestActor.name}
            size="md"
            className="size-10"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <Icon className="size-5 text-muted-foreground" aria-hidden />
          </div>
        )}
        {item.latestActor && (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border-2 border-surface-card bg-muted">
            <Icon className="size-2.5 text-foreground" aria-hidden />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-ink">{item.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
        </p>
      </div>
      {!item.read && (
        <span
          className="mt-2 size-2 shrink-0 rounded-full bg-primary"
          aria-hidden
        />
      )}
    </Link>
  );
}
