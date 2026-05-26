import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudioTable } from "@/components/studio/StudioTable";

export default async function ProfileContentPage() {
  const session = await auth();
  if (!session?.user?.channelId) {
    redirect("/login?callbackUrl=/profile/content");
  }

  const videos = await prisma.video.findMany({
    where: { channelId: session.user.channelId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      views: true,
      visibility: true,
      status: true,
      createdAt: true,
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-ink">Your videos</h2>
      <p className="mb-6 text-sm text-secondary-foreground">
        Edit metadata, visibility, thumbnails, or remove videos from your channel.
      </p>
      <StudioTable
        videos={videos.map((video) => ({
          ...video,
          tags: video.tags.map((t) => t.tag.name),
        }))}
      />
    </div>
  );
}
