import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { videoListSelect } from "@/lib/data/videos";
import { isMissingSavedVideoTableError } from "@/lib/prisma-errors";
import type { VideoListItem } from "@/lib/data/videos";

export const SAVED_VIDEOS_PAGE_SIZE = 50;

export type SavedVideoEntry = {
  savedAt: string;
  video: VideoListItem;
};

export type SavedVideosPage = {
  items: SavedVideoEntry[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

type SavedVideoWithVideo = Prisma.SavedVideoGetPayload<{
  include: { video: { select: typeof videoListSelect } };
}>;

export async function getSavedVideosPage(
  userId: string,
  page: number
): Promise<SavedVideosPage> {
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * SAVED_VIDEOS_PAGE_SIZE;

  let items: SavedVideoWithVideo[] = [];
  let total = 0;

  try {
    [items, total] = await Promise.all([
      prisma.savedVideo.findMany({
        where: { userId },
        orderBy: { savedAt: "desc" },
        skip,
        take: SAVED_VIDEOS_PAGE_SIZE,
        include: {
          video: { select: videoListSelect },
        },
      }),
      prisma.savedVideo.count({ where: { userId } }),
    ]);
  } catch (error) {
    if (!isMissingSavedVideoTableError(error)) {
      throw error;
    }
  }

  const mapped = items.map((s) => ({
    savedAt: s.savedAt.toISOString(),
    video: s.video,
  }));

  return {
    items: mapped,
    page: safePage,
    pageSize: SAVED_VIDEOS_PAGE_SIZE,
    total,
    hasMore: skip + mapped.length < total,
  };
}
