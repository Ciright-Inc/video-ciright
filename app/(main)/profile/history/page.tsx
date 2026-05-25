import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ClearHistoryButton } from "@/components/profile/ClearHistoryButton";
import { WatchHistoryFeed } from "@/components/video/WatchHistoryFeed";
import { getWatchHistoryPage } from "@/lib/profile/watchHistoryPage";

export default async function ProfileHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile/history");
  }

  const initialPage = await getWatchHistoryPage(session.user.id, 1);
  const hasHistory = initialPage.total > 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Watch history</h2>
          <p className="text-sm text-secondary-foreground">
            Videos you&apos;ve watched while signed in.
          </p>
        </div>
        {hasHistory ? <ClearHistoryButton /> : null}
      </div>

      {!hasHistory ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-secondary-foreground">No watch history yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-text-link no-underline hover:underline"
          >
            Browse videos
          </Link>
        </div>
      ) : (
        <WatchHistoryFeed initialPage={initialPage} />
      )}
    </div>
  );
}
