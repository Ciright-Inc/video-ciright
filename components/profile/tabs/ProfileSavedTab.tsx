"use client";

import Link from "next/link";
import { ProfileHistorySkeleton } from "@/components/profile/ProfileSkeletons";
import { SavedVideosFeed } from "@/components/video/SavedVideosFeed";
import type { SavedVideosPage } from "@/lib/profile/savedVideosPage";
import { useSavedVideosInfinite } from "@/lib/queries/saved-videos";

export function ProfileSavedTab({
  initialPage,
}: {
  initialPage?: SavedVideosPage;
}) {
  const { data, isLoading, isError } = useSavedVideosInfinite(initialPage);
  const total = data?.pages[0]?.total ?? 0;
  const hasSaved = total > 0;

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-ink">Saved videos</h2>
          <p className="text-sm text-secondary-foreground">
            Videos you&apos;ve saved from the watch page.
          </p>
        </div>
        <ProfileHistorySkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-secondary-foreground">
        Could not load saved videos. Try refreshing the page.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-ink">Saved videos</h2>
        <p className="text-sm text-secondary-foreground">
          Videos you&apos;ve saved from the watch page.
        </p>
      </div>

      {!hasSaved ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-secondary-foreground">No saved videos yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap Save on a video to add it here.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-text-link no-underline hover:underline"
          >
            Browse videos
          </Link>
        </div>
      ) : (
        <SavedVideosFeed initialPage={initialPage} />
      )}
    </div>
  );
}
