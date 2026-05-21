import { prisma } from "@/lib/prisma";
import { VideoStatus, Visibility } from "@prisma/client";
import { videoListSelect } from "./videos";

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

export async function getSubscribedChannels(userId: string) {
  const subs = await prisma.subscription.findMany({
    where: { subscriberId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      channel: {
        select: {
          id: true,
          handle: true,
          name: true,
          avatarUrl: true,
          _count: { select: { subscribers: true } },
        },
      },
    },
  });
  return subs.map((s) => s.channel);
}

export type SubscribedChannel = Awaited<
  ReturnType<typeof getSubscribedChannels>
>[number];

export async function getSubscriptionFeedVideos(
  userId: string,
  options?: { limit?: number; channelId?: string }
) {
  const { limit = 48, channelId } = options ?? {};

  if (channelId) {
    return prisma.video.findMany({
      where: {
        channelId,
        status: VideoStatus.READY,
        visibility: Visibility.PUBLIC,
      },
      select: videoListSelect,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  const subscribedChannelIds = await prisma.subscription.findMany({
    where: { subscriberId: userId },
    select: { channelId: true },
  });

  if (subscribedChannelIds.length === 0) return [];

  return prisma.video.findMany({
    where: {
      channelId: { in: subscribedChannelIds.map((s) => s.channelId) },
      status: VideoStatus.READY,
      visibility: Visibility.PUBLIC,
    },
    select: videoListSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
