import { prisma } from "@/lib/prisma";

export async function isVideoSaved(userId: string, videoId: string) {
  const saved = await prisma.savedVideo.findUnique({
    where: { userId_videoId: { userId, videoId } },
  });
  return !!saved;
}
