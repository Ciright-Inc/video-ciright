import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    await prisma.savedVideo.create({
      data: { userId, videoId },
    });

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Failed to update save" }, { status: 500 });
  }
}
