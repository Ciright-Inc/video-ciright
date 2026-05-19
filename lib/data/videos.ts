import { prisma } from "@/lib/prisma";
import { Prisma, VideoStatus, Visibility } from "@prisma/client";

export const videoListSelect = {
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
} satisfies Prisma.VideoSelect;

export type VideoListItem = Prisma.VideoGetPayload<{
  select: typeof videoListSelect;
}>;

export async function getPublicVideos(options?: {
  limit?: number;
  cursor?: string;
  channelId?: string;
}) {
  const { limit = 24, cursor, channelId } = options ?? {};

  return prisma.video.findMany({
    where: {
      status: VideoStatus.READY,
      visibility: Visibility.PUBLIC,
      ...(channelId ? { channelId } : {}),
    },
    select: videoListSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor
      ? {
          skip: 1,
          cursor: { id: cursor },
        }
      : {}),
  });
}

export async function getVideoById(id: string) {
  return prisma.video.findUnique({
    where: { id },
    include: {
      channel: {
        include: {
          _count: { select: { subscribers: true, videos: true } },
        },
      },
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

export async function getRelatedVideos(videoId: string, channelId: string, limit = 8) {
  return prisma.video.findMany({
    where: {
      id: { not: videoId },
      channelId,
      status: VideoStatus.READY,
      visibility: Visibility.PUBLIC,
    },
    select: videoListSelect,
    orderBy: { views: "desc" },
    take: limit,
  });
}

export async function searchVideos(query: string, limit = 24) {
  if (!query.trim()) return [];

  try {
    const rows = await prisma.$queryRaw<VideoListItem[]>`
      SELECT v.id, v.title, v."thumbnailUrl", v."videoUrl", v.duration, v.views,
             v.status::text as status, v.visibility::text as visibility, v."isLive", v."createdAt",
             json_build_object(
               'id', c.id,
               'handle', c.handle,
               'name', c.name,
               'avatarUrl', c."avatarUrl"
             ) as channel
      FROM "Video" v
      JOIN "Channel" c ON c.id = v."channelId"
      WHERE v.status = 'READY'
        AND v.visibility = 'PUBLIC'
        AND to_tsvector('english', coalesce(v.title, '') || ' ' || coalesce(v.description, ''))
            @@ plainto_tsquery('english', ${query})
      ORDER BY ts_rank(
        to_tsvector('english', coalesce(v.title, '') || ' ' || coalesce(v.description, '')),
        plainto_tsquery('english', ${query})
      ) DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      ...row,
      status: row.status as VideoStatus,
      visibility: row.visibility as Visibility,
      channel:
        typeof row.channel === "string"
          ? JSON.parse(row.channel)
          : row.channel,
    }));
  } catch {
    return prisma.video.findMany({
      where: {
        status: VideoStatus.READY,
        visibility: Visibility.PUBLIC,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: videoListSelect,
      orderBy: { views: "desc" },
      take: limit,
    });
  }
}

export async function incrementVideoViews(id: string) {
  return prisma.video.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}
