import { NotificationType, VideoStatus, Visibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { recordNotification } from "@/lib/notifications/record";

export async function notifyVideoReadyIfPublic(videoId: string): Promise<void> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      id: true,
      status: true,
      visibility: true,
      channelId: true,
      channel: { select: { ownerId: true, name: true } },
    },
  });

  if (!video) return;
  if (video.status !== VideoStatus.READY) return;
  if (video.visibility !== Visibility.PUBLIC) return;

  const subscribers = await prisma.subscription.findMany({
    where: { channelId: video.channelId },
    select: { subscriberId: true },
  });

  await Promise.all(
    subscribers.map((sub) =>
      recordNotification({
        recipientId: sub.subscriberId,
        type: NotificationType.SUBSCRIPTION_NEW_VIDEO,
        actorId: video.channel.ownerId,
        channelId: video.channelId,
        targetVideoId: video.id,
        videoId: video.id,
      })
    )
  );
}
