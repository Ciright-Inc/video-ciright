import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVideoLikeStats } from "@/lib/data/likes";

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

    if (value === 0) {
      await prisma.like.deleteMany({ where: { userId, videoId } });
    } else {
      await prisma.like.upsert({
        where: { userId_videoId: { userId, videoId } },
        create: { userId, videoId, value },
        update: { value },
      });
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
