import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPublicVideos } from "@/lib/data/videos";
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
    const { title, description, videoUrl, thumbnailUrl, visibility, tags } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: "Title and video URL are required" },
        { status: 400 }
      );
    }

    const video = await prisma.video.create({
      data: {
        title,
        description: description ?? null,
        videoUrl,
        thumbnailUrl: thumbnailUrl ?? null,
        visibility: visibility ?? Visibility.PUBLIC,
        status: VideoStatus.READY,
        channelId: session.user.channelId,
        tags: tags?.length
          ? {
              create: await Promise.all(
                (tags as string[]).map(async (name: string) => {
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
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}
