import { NotificationType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  isMissingNotificationSchemaError,
  warnMissingNotificationSchema,
} from "@/lib/prisma-errors";

export type RecordNotificationInput = {
  recipientId: string;
  type: NotificationType;
  actorId: string;
  videoId?: string;
  commentId?: string;
  channelId?: string;
  targetVideoId?: string;
};

function unreadGroupWhere(
  input: RecordNotificationInput
): Prisma.NotificationWhereInput {
  const base: Prisma.NotificationWhereInput = {
    recipientId: input.recipientId,
    type: input.type,
    readAt: null,
  };

  if (input.videoId) base.videoId = input.videoId;
  if (input.commentId) base.commentId = input.commentId;
  if (input.channelId) base.channelId = input.channelId;

  return base;
}

export async function recordNotification(
  input: RecordNotificationInput
): Promise<void> {
  const { recipientId, type, actorId } = input;

  if (recipientId === actorId) return;

  try {
    await recordNotificationInner(input);
  } catch (error) {
    if (isMissingNotificationSchemaError(error)) {
      warnMissingNotificationSchema();
      return;
    }
    throw error;
  }
}

async function recordNotificationInner(
  input: RecordNotificationInput
): Promise<void> {
  const { recipientId, type, actorId } = input;

  const existing = await prisma.notification.findFirst({
    where: unreadGroupWhere(input),
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    const alreadyCounted = await prisma.notificationActor.findUnique({
      where: {
        notificationId_actorId: {
          notificationId: existing.id,
          actorId,
        },
      },
    });

    if (alreadyCounted) {
      await prisma.notification.update({
        where: { id: existing.id },
        data: {
          latestActorId: actorId,
          ...(input.targetVideoId && { targetVideoId: input.targetVideoId }),
          updatedAt: new Date(),
        },
      });
      return;
    }

    await prisma.$transaction([
      prisma.notificationActor.create({
        data: { notificationId: existing.id, actorId },
      }),
      prisma.notification.update({
        where: { id: existing.id },
        data: {
          actorCount: { increment: 1 },
          latestActorId: actorId,
          ...(input.targetVideoId && { targetVideoId: input.targetVideoId }),
        },
      }),
    ]);
    return;
  }

  await prisma.notification.create({
    data: {
      recipientId,
      type,
      videoId: input.videoId ?? null,
      commentId: input.commentId ?? null,
      channelId: input.channelId ?? null,
      targetVideoId: input.targetVideoId ?? null,
      latestActorId: actorId,
      actors: { create: { actorId } },
    },
  });
}
