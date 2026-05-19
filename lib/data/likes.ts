import { prisma } from "@/lib/prisma";

export async function getVideoLikeStats(videoId: string) {
  const likes = await prisma.like.groupBy({
    by: ["value"],
    where: { videoId },
    _count: { value: true },
  });

  const likeCount = likes.find((l) => l.value === 1)?._count.value ?? 0;
  const dislikeCount = likes.find((l) => l.value === -1)?._count.value ?? 0;

  return { likeCount, dislikeCount };
}

export async function getUserLikeValue(userId: string, videoId: string) {
  const like = await prisma.like.findUnique({
    where: { userId_videoId: { userId, videoId } },
  });
  return like?.value ?? 0;
}
