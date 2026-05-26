import { NextResponse } from "next/server";
import { ChannelGeoMetric, VideoStatus, Visibility } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVideoById, incrementVideoViews } from "@/lib/data/videos";
import { recordChannelGeoEvent } from "@/lib/analytics/recordChannelGeoEvent";
import {
  buildVideoAssetPrefix,
  deleteObject,
  deleteObjectsByPrefix,
  tryExtractKeyFromPublicObjectUrl,
} from "@/lib/s3";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const video = await getVideoById(id);
  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(video);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const session = await auth();

  if (body.incrementViews) {
    try {
      const video = await incrementVideoViews(id);
      void recordChannelGeoEvent(
        request,
        video.channelId,
        ChannelGeoMetric.VIEW,
        session?.user?.id
      );
      return NextResponse.json({ views: video.views });
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  if (typeof body.duration === "number" && body.duration > 0) {
    const existing = await prisma.video.findUnique({
      where: { id },
      select: { duration: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.duration == null) {
      const video = await prisma.video.update({
        where: { id },
        data: { duration: Math.round(body.duration) },
      });
      return NextResponse.json({ duration: video.duration });
    }
    return NextResponse.json({ duration: existing.duration });
  }

  if (!session?.user?.channelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    title,
    description,
    visibility,
    status,
    thumbnailUrl,
    tags,
  } = body as {
    title?: string;
    description?: string | null;
    visibility?: Visibility;
    status?: VideoStatus;
    thumbnailUrl?: string | null;
    tags?: unknown;
  };

  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing || existing.channelId !== session.user.channelId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    return NextResponse.json({ error: "tags must be an array" }, { status: 400 });
  }

  const normalizedTags =
    tags === undefined
      ? undefined
      : [
          ...new Set(
            tags
              .filter((t): t is string => typeof t === "string")
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean)
          ),
        ];

  const video = await prisma.$transaction(async (tx) => {
    if (normalizedTags !== undefined) {
      await tx.videoTag.deleteMany({ where: { videoId: id } });
      if (normalizedTags.length > 0) {
        const tagRecords = await Promise.all(
          normalizedTags.map((name) =>
            tx.tag.upsert({
              where: { name },
              create: { name },
              update: {},
            })
          )
        );
        await tx.videoTag.createMany({
          data: tagRecords.map((tag) => ({ videoId: id, tagId: tag.id })),
        });
      }
    }

    return tx.video.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(visibility !== undefined && { visibility }),
        ...(status !== undefined && { status }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      },
      include: {
        tags: { select: { tag: { select: { name: true } } } },
      },
    });
  });

  const thumbnailChanged =
    thumbnailUrl !== undefined && existing.thumbnailUrl !== video.thumbnailUrl;
  if (thumbnailChanged && existing.thumbnailUrl) {
    const oldKey = tryExtractKeyFromPublicObjectUrl(existing.thumbnailUrl);
    const newKey = video.thumbnailUrl
      ? tryExtractKeyFromPublicObjectUrl(video.thumbnailUrl)
      : null;
    if (oldKey && oldKey !== newKey) {
      try {
        await deleteObject(oldKey);
      } catch (err) {
        console.error("Failed to delete replaced video thumbnail:", oldKey, err);
      }
    }
  }

  return NextResponse.json({
    ...video,
    tags: video.tags.map((vt) => vt.tag.name),
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.channelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing || existing.channelId !== session.user.channelId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await deleteObjectsByPrefix(
      buildVideoAssetPrefix(existing.channelId, existing.id)
    );
  } catch (e) {
    const legacyKey =
      tryExtractKeyFromPublicObjectUrl(existing.videoUrl);
    if (legacyKey) {
      try {
        await deleteObject(legacyKey);
      } catch (inner) {
        console.error("S3 delete failed (video still removed from DB):", inner);
      }
    } else {
      console.error("S3 delete failed (video still removed from DB):", e);
    }
  }

  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
