import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { videoListSelect } from "@/lib/data/videos";
import { RelatedVideoCard } from "@/components/video/RelatedVideoCard";
import { ClearHistoryButton } from "@/components/profile/ClearHistoryButton";
import { groupWatchHistory } from "@/lib/profile/historyGroups";
import { isMissingWatchHistoryTableError } from "@/lib/prisma-errors";

async function getWatchHistoryRows(userId: string) {
  try {
    return await prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { watchedAt: "desc" },
      take: 200,
      include: {
        video: { select: videoListSelect },
      },
    });
  } catch (error) {
    if (isMissingWatchHistoryTableError(error)) {
      return [];
    }
    throw error;
  }
}

export default async function ProfileHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile/history");
  }

  const rows = await getWatchHistoryRows(session.user.id);

  const grouped = groupWatchHistory(
    rows.map((r) => ({
      watchedAt: r.watchedAt,
      video: r.video,
    }))
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Watch history</h2>
          <p className="text-sm text-body">
            Videos you&apos;ve watched while signed in.
          </p>
        </div>
        {rows.length > 0 ? <ClearHistoryButton /> : null}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-body">No watch history yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-text-link no-underline hover:underline"
          >
            Browse videos
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((section) => (
            <section key={section.label}>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                {section.label}
              </h3>
              <div className="flex flex-col gap-1">
                {section.rows.map((row) => (
                  <RelatedVideoCard
                    key={`${row.video.id}-${row.watchedAt.toISOString()}`}
                    video={row.video}
                    contextDate={row.watchedAt}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
