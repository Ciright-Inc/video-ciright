import { prisma } from "@/lib/prisma";
import { isMissingNotificationSchemaError } from "@/lib/prisma-errors";

const emptyStats = { likeCount: 0, dislikeCount: 0 };

export async function getCommentLikeStats(commentId: string) {
  try {
    return await getCommentLikeStatsInner(commentId);
  } catch (error) {
    if (isMissingNotificationSchemaError(error)) {
      return emptyStats;
    }
    throw error;
  }
}

async function getCommentLikeStatsInner(commentId: string) {
  const likes = await prisma.commentLike.groupBy({
    by: ["value"],
    where: { commentId },
    _count: { value: true },
  });

  const likeCount = likes.find((l) => l.value === 1)?._count.value ?? 0;
  const dislikeCount = likes.find((l) => l.value === -1)?._count.value ?? 0;

  return { likeCount, dislikeCount };
}

export async function getUserCommentLikeValue(
  userId: string,
  commentId: string
) {
  try {
    const like = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    return like?.value ?? 0;
  } catch (error) {
    if (isMissingNotificationSchemaError(error)) {
      return 0;
    }
    throw error;
  }
}

export async function getCommentLikeStatsForIds(
  commentIds: string[],
  userId?: string
) {
  if (commentIds.length === 0) {
    return new Map<
      string,
      { likeCount: number; dislikeCount: number; userValue: number }
    >();
  }

  try {
    return await getCommentLikeStatsForIdsInner(commentIds, userId);
  } catch (error) {
    if (isMissingNotificationSchemaError(error)) {
      return new Map(
        commentIds.map((id) => [
          id,
          { likeCount: 0, dislikeCount: 0, userValue: 0 },
        ])
      );
    }
    throw error;
  }
}

async function getCommentLikeStatsForIdsInner(
  commentIds: string[],
  userId?: string
) {
  const grouped = await prisma.commentLike.groupBy({
    by: ["commentId", "value"],
    where: { commentId: { in: commentIds } },
    _count: { value: true },
  });

  const userLikes = userId
    ? await prisma.commentLike.findMany({
        where: { userId, commentId: { in: commentIds } },
        select: { commentId: true, value: true },
      })
    : [];

  const userValueByComment = new Map(
    userLikes.map((l) => [l.commentId, l.value])
  );

  const map = new Map<
    string,
    { likeCount: number; dislikeCount: number; userValue: number }
  >();

  for (const id of commentIds) {
    map.set(id, {
      likeCount: 0,
      dislikeCount: 0,
      userValue: userValueByComment.get(id) ?? 0,
    });
  }

  for (const row of grouped) {
    const entry = map.get(row.commentId)!;
    if (row.value === 1) entry.likeCount = row._count.value;
    if (row.value === -1) entry.dislikeCount = row._count.value;
  }

  return map;
}
