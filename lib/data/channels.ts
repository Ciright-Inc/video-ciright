import { prisma } from "@/lib/prisma";
import { VideoStatus, Visibility } from "@prisma/client";
import { paginate, type PaginatedResult } from "@/lib/data/pagination";
import { videoListSelect, type VideoListItem } from "./videos";

const DEFAULT_PAGE_LIMIT = 24;

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
  const page = await getChannelVideosPage(channelId);
  return page.items;
}

export async function getChannelVideosPage(
  channelId: string,
  options?: { limit?: number; cursor?: string }
): Promise<PaginatedResult<VideoListItem>> {
  const { limit = DEFAULT_PAGE_LIMIT, cursor } = options ?? {};
  const take = limit + 1;

  const rows = await prisma.video.findMany({
    where: {
      channelId,
      status: VideoStatus.READY,
      visibility: { in: [Visibility.PUBLIC, Visibility.UNLISTED] },
    },
    select: videoListSelect,
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor
      ? {
          skip: 1,
          cursor: { id: cursor },
        }
      : {}),
  });

  return paginate(rows, limit);
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
  const page = await getSubscriptionFeedVideosPage(userId, options);
  return page.items;
}

export async function getSubscriptionFeedVideosPage(
  userId: string,
  options?: { limit?: number; channelId?: string; cursor?: string }
): Promise<PaginatedResult<VideoListItem>> {
  const { limit = DEFAULT_PAGE_LIMIT, channelId, cursor } = options ?? {};
  const take = limit + 1;

  if (channelId) {
    const rows = await prisma.video.findMany({
      where: {
        channelId,
        status: VideoStatus.READY,
        visibility: Visibility.PUBLIC,
      },
      select: videoListSelect,
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    });
    return paginate(rows, limit);
  }

  const subscribedChannelIds = await prisma.subscription.findMany({
    where: { subscriberId: userId },
    select: { channelId: true },
  });

  if (subscribedChannelIds.length === 0) {
    return { items: [] };
  }

  const rows = await prisma.video.findMany({
    where: {
      channelId: { in: subscribedChannelIds.map((s) => s.channelId) },
      status: VideoStatus.READY,
      visibility: Visibility.PUBLIC,
    },
    select: videoListSelect,
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor
      ? {
          skip: 1,
          cursor: { id: cursor },
        }
      : {}),
  });

  return paginate(rows, limit);
}
