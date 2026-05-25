import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SavedVideosFeed } from "@/components/video/SavedVideosFeed";
import { getSavedVideosPage } from "@/lib/profile/savedVideosPage";

export default async function ProfileSavedPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile/saved");
  }

  const initialPage = await getSavedVideosPage(session.user.id, 1);
  const hasSaved = initialPage.total > 0;

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
