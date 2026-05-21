import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPublicVideos } from "@/lib/data/videos";
import { isTranscodingEnabled, triggerTranscode } from "@/lib/transcode";
import { VideoStatus, Visibility } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 24);
  const cursor = searchParams.get("cursor") ?? undefined;
  const channelId = searchParams.get("channelId") ?? undefined;

  const videos = await getPublicVideos({ limit, cursor, channelId });
  return NextResponse.json(videos);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.channelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id: requestedId,
      title,
      description,
      videoUrl,
      thumbnailUrl,
      visibility,
      tags,
      s3Key,
      useExternalUrl,
      duration,
    } = body as {
      id?: string;
      title?: string;
      description?: string;
      videoUrl?: string;
      thumbnailUrl?: string;
      visibility?: Visibility;
      tags?: string[];
      s3Key?: string;
      useExternalUrl?: boolean;
      duration?: number;
    };

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Title and video URL are required" },
        { status: 400 }
      );
    }

    const needsTranscode =
      !useExternalUrl && Boolean(s3Key) && isTranscodingEnabled();

    const roundedDuration =
      typeof duration === "number" && Number.isFinite(duration) && duration > 0
        ? Math.round(duration)
        : undefined;

    const data = {
      ...(requestedId ? { id: requestedId } : {}),
      title,
      description: description ?? null,
      videoUrl,
      thumbnailUrl: thumbnailUrl ?? null,
      ...(roundedDuration != null && { duration: roundedDuration }),
      visibility: visibility ?? Visibility.PUBLIC,
      status: needsTranscode ? VideoStatus.PROCESSING : VideoStatus.READY,
      channelId: session.user.channelId,
      tags: tags?.length
        ? {
            create: await Promise.all(
              tags.map(async (name: string) => {
                const tag = await prisma.tag.upsert({
                  where: { name: name.toLowerCase() },
                  create: { name: name.toLowerCase() },
                  update: {},
                });
                return { tagId: tag.id };
              })
            ),
          }
        : undefined,
    };

    const video = await prisma.video.create({ data });

    if (needsTranscode && s3Key) {
      const transcodeResult = await triggerTranscode({
        videoId: video.id,
        channelId: video.channelId,
        s3Key,
      });

      if (!transcodeResult.ok) {
        await prisma.video.update({
          where: { id: video.id },
          data: { status: VideoStatus.FAILED },
        });
        return NextResponse.json(
          {
            error:
              transcodeResult.error ??
              "Video saved but transcoding could not start",
            id: video.id,
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("POST /api/videos failed:", error);
    const detail =
      error instanceof Error ? error.message : "Failed to create video";
    return NextResponse.json(
      {
        error: "Failed to create video",
        ...(process.env.NODE_ENV === "development" && { detail }),
      },
      { status: 500 }
    );
  }
}
