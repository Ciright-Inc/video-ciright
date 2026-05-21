import { prisma } from "@/lib/prisma";
import { formatNotificationMessage } from "@/lib/notifications/messages";

const notificationInclude = {
  latestActor: { select: { id: true, name: true, image: true } },
  video: { select: { id: true, title: true, thumbnailUrl: true } },
  comment: { select: { id: true, videoId: true } },
  channel: { select: { id: true, name: true, avatarUrl: true } },
} as const;

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { recipientId: userId, readAt: null },
  });
}

export async function markNotificationsRead(
  userId: string,
  options: { ids?: string[]; all?: boolean }
): Promise<void> {
  const now = new Date();

  if (options.all) {
    await prisma.notification.updateMany({
      where: { recipientId: userId, readAt: null },
      data: { readAt: now },
    });
    return;
  }

  if (options.ids?.length) {
    await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        id: { in: options.ids },
        readAt: null,
      },
      data: { readAt: now },
    });
  }
}

export async function getNotificationsForUser(
  userId: string,
  options?: { limit?: number; cursor?: string }
) {
  const limit = options?.limit ?? 20;

  const rows = await prisma.notification.findMany({
    where: { recipientId: userId },
    include: notificationInclude,
    orderBy: { updatedAt: "desc" },
    take: limit + 1,
    ...(options?.cursor
      ? {
          cursor: { id: options.cursor },
          skip: 1,
        }
      : {}),
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

  return {
    items: items.map((n) => {
      const watchVideoId =
        n.targetVideoId ?? n.videoId ?? n.comment?.videoId ?? n.video?.id;
      const href = watchVideoId ? `/watch/${watchVideoId}` : "/";
      const thumbnailUrl =
        n.video?.thumbnailUrl ?? n.channel?.avatarUrl ?? null;

      return {
        id: n.id,
        type: n.type,
        title: formatNotificationMessage({
          type: n.type,
          actorCount: n.actorCount,
          latestActorName: n.latestActor?.name,
          channelName: n.channel?.name,
        }),
        href,
        thumbnailUrl,
        actorCount: n.actorCount,
        read: n.readAt != null,
        updatedAt: n.updatedAt.toISOString(),
        latestActor: n.latestActor,
      };
    }),
    nextCursor,
  };
}
