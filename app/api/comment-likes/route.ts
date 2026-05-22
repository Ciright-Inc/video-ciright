import { NextResponse } from "next/server";
import { NotificationType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getCommentLikeStats,
  getUserCommentLikeValue,
} from "@/lib/data/comment-likes";
import { isMissingNotificationSchemaError } from "@/lib/prisma-errors";
import { recordNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { commentId, value } = await request.json();

    if (!commentId || ![1, -1, 0].includes(value)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const userId = session.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true, videoId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (value === 0) {
      await prisma.commentLike.deleteMany({
        where: { userId, commentId },
      });
    } else {
      await prisma.commentLike.upsert({
        where: { userId_commentId: { userId, commentId } },
        create: { userId, commentId, value },
        update: { value },
      });

      if (value === 1) {
        await recordNotification({
          recipientId: comment.authorId,
          type: NotificationType.COMMENT_LIKE,
          actorId: userId,
          commentId: comment.id,
          videoId: comment.videoId,
        });
      } else if (value === -1) {
        await recordNotification({
          recipientId: comment.authorId,
          type: NotificationType.COMMENT_DISLIKE,
          actorId: userId,
          commentId: comment.id,
          videoId: comment.videoId,
        });
      }
    }

    const stats = await getCommentLikeStats(commentId);
    const userValue = await getUserCommentLikeValue(userId, commentId);

    return NextResponse.json({
      ...stats,
      userValue,
    });
  } catch (error) {
    if (isMissingNotificationSchemaError(error)) {
      return NextResponse.json(
        {
          error:
            "Comment likes are unavailable until notification tables are migrated. Run: npm run db:setup-notifications",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update comment like" },
      { status: 500 }
    );
  }
}
