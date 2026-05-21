import { NextResponse } from "next/server";
import { NotificationType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCommentsByVideoId } from "@/lib/data/comments";
import { recordNotification } from "@/lib/notifications";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  const session = await auth();
  const comments = await getCommentsByVideoId(
    videoId,
    session?.user?.id
  );
  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { videoId, body, parentId } = await request.json();

    if (!videoId || !body?.trim()) {
      return NextResponse.json(
        { error: "videoId and body are required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        body: body.trim(),
        videoId,
        authorId: session.user.id,
        parentId: parentId ?? null,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });
      if (parent) {
        await recordNotification({
          recipientId: parent.authorId,
          type: NotificationType.COMMENT_REPLY,
          actorId: session.user.id,
          commentId: parentId,
          videoId,
        });
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
