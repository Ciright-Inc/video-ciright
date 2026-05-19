import { prisma } from "@/lib/prisma";

export async function getCommentsByVideoId(videoId: string) {
  return prisma.comment.findMany({
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
}
