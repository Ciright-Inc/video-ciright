import { NextResponse } from "next/server";
import { ChannelGeoMetric, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { videoListSelect } from "@/lib/data/videos";
import { recordWatchHistory } from "@/lib/profile/recordWatchHistory";
import { isMissingWatchHistoryTableError } from "@/lib/prisma-errors";
import { recordChannelGeoEvent } from "@/lib/analytics/recordChannelGeoEvent";

const PAGE_SIZE = 50;

type WatchHistoryWithVideo = Prisma.WatchHistoryGetPayload<{
  include: { video: { select: typeof videoListSelect } };
}>;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  let items: WatchHistoryWithVideo[] = [];
  let total = 0;

  try {
    [items, total] = await Promise.all([
      prisma.watchHistory.findMany({
        where: { userId: session.user.id },
        orderBy: { watchedAt: "desc" },
        skip,
        take: PAGE_SIZE,
        include: {
          video: { select: videoListSelect },
        },
      }),
      prisma.watchHistory.count({ where: { userId: session.user.id } }),
    ]);
  } catch (error) {
    if (!isMissingWatchHistoryTableError(error)) {
      throw error;
    }
  }

  return NextResponse.json({
    items: items.map((h) => ({
      watchedAt: h.watchedAt.toISOString(),
      video: h.video,
    })),
    page,
    pageSize: PAGE_SIZE,
    total,
    hasMore: skip + items.length < total,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const videoId = typeof body.videoId === "string" ? body.videoId : null;
  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { channelId: true },
  });
  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await recordWatchHistory(session.user.id, videoId);

  void recordChannelGeoEvent(request, video.channelId, ChannelGeoMetric.WATCH);

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.watchHistory.deleteMany({
      where: { userId: session.user.id },
    });
  } catch (error) {
    if (!isMissingWatchHistoryTableError(error)) {
      throw error;
    }
  }

  return NextResponse.json({ ok: true });
}
