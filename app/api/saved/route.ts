import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { videoListSelect } from "@/lib/data/videos";
import { getSavedVideosPage } from "@/lib/profile/savedVideosPage";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const result = await getSavedVideosPage(session.user.id, page);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { videoId } = await request.json();

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json({ error: "videoId required" }, { status: 400 });
    }

    const userId = session.user.id;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const existing = await prisma.savedVideo.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });

    if (existing) {
      await prisma.savedVideo.delete({
        where: { userId_videoId: { userId, videoId } },
      });
      return NextResponse.json({ saved: false });
    }

    const created = await prisma.savedVideo.create({
      data: { userId, videoId },
      include: { video: { select: videoListSelect } },
    });

    return NextResponse.json({
      saved: true,
      entry: {
        savedAt: created.savedAt.toISOString(),
        video: created.video,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to update save" }, { status: 500 });
  }
}
