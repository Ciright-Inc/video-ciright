import { prisma } from "@/lib/prisma";

export async function getCommentLikeStats(commentId: string) {
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
  const like = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });
  return like?.value ?? 0;
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
