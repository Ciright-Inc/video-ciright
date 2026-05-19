import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudioTable } from "@/components/studio/StudioTable";

export default async function StudioPage() {
  const session = await auth();
  if (!session?.user?.channelId) {
    redirect("/login?callbackUrl=/studio");
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
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold text-ink">Creator Studio</h1>
      <p className="mb-6 text-sm text-body">
        Manage your videos, visibility, and view analytics.
      </p>
      <StudioTable videos={videos} />
    </div>
  );
}
