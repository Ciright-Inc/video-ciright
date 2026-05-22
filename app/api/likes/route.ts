import { NextResponse } from "next/server";
import { ChannelGeoMetric, NotificationType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVideoLikeStats } from "@/lib/data/likes";
import { recordNotification } from "@/lib/notifications";
import { recordChannelGeoEvent } from "@/lib/analytics/recordChannelGeoEvent";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { videoId, value } = await request.json();

    if (!videoId || ![1, -1, 0].includes(value)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const userId = session.user.id;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        channelId: true,
        channel: { select: { ownerId: true } },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (value === 0) {
      await prisma.like.deleteMany({ where: { userId, videoId } });
    } else {
      await prisma.like.upsert({
        where: { userId_videoId: { userId, videoId } },
        create: { userId, videoId, value },
        update: { value },
      });

      if (value === 1) {
        await recordNotification({
          recipientId: video.channel.ownerId,
          type: NotificationType.VIDEO_LIKE,
          actorId: userId,
          videoId,
        });
      } else if (value === -1) {
        await recordNotification({
          recipientId: video.channel.ownerId,
          type: NotificationType.VIDEO_DISLIKE,
          actorId: userId,
          videoId,
        });
      }

      const geoMetric =
        value === 1 ? ChannelGeoMetric.LIKE : ChannelGeoMetric.DISLIKE;
      void recordChannelGeoEvent(
        request,
        video.channelId,
        geoMetric,
        userId
      );
    }

    const stats = await getVideoLikeStats(videoId);
    const userLike = await prisma.like.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });

    return NextResponse.json({
      ...stats,
      userValue: userLike?.value ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}
