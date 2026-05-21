import { prisma } from "@/lib/prisma";
import { getCommentLikeStatsForIds } from "@/lib/data/comment-likes";

export async function getCommentsByVideoId(
  videoId: string,
  userId?: string
) {
  const comments = await prisma.comment.findMany({
    where: { videoId, parentId: null },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const allIds: string[] = [];
  for (const c of comments) {
    allIds.push(c.id);
    for (const r of c.replies) allIds.push(r.id);
  }

  const statsMap = await getCommentLikeStatsForIds(allIds, userId);

  return comments.map((comment) => ({
    ...comment,
    likeCount: statsMap.get(comment.id)?.likeCount ?? 0,
    dislikeCount: statsMap.get(comment.id)?.dislikeCount ?? 0,
    userValue: statsMap.get(comment.id)?.userValue ?? 0,
    replies: comment.replies.map((reply) => ({
      ...reply,
      likeCount: statsMap.get(reply.id)?.likeCount ?? 0,
      dislikeCount: statsMap.get(reply.id)?.dislikeCount ?? 0,
      userValue: statsMap.get(reply.id)?.userValue ?? 0,
    })),
  }));
}
