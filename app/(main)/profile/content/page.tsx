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
      thumbnailUrl: true,
      views: true,
      visibility: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-ink">Your videos</h2>
      <p className="mb-6 text-sm text-secondary-foreground">
        Edit titles, visibility, or remove videos from your channel.
      </p>
      <StudioTable videos={videos} />
    </div>
  );
}
