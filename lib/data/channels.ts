import { prisma } from "@/lib/prisma";
import { VideoStatus, Visibility } from "@prisma/client";

export async function getChannelById(id: string) {
  return prisma.channel.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { subscribers: true, videos: true } },
    },
  });
}

export async function getChannelVideos(channelId: string) {
  return prisma.video.findMany({
    where: {
      channelId,
      status: VideoStatus.READY,
      visibility: { in: [Visibility.PUBLIC, Visibility.UNLISTED] },
    },
    select: {
      id: true,
      title: true,
      thumbnailUrl: true,
      videoUrl: true,
      duration: true,
      views: true,
      status: true,
      visibility: true,
      isLive: true,
      createdAt: true,
      channel: {
        select: {
          id: true,
          handle: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function isSubscribed(subscriberId: string, channelId: string) {
  const sub = await prisma.subscription.findUnique({
    where: {
      subscriberId_channelId: { subscriberId, channelId },
    },
  });
  return !!sub;
}
