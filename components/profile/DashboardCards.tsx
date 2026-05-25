import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

type RecentComment = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string | null; image: string | null };
  video: { id: string; title: string };
};

export function DashboardCards(props: {
  totalViews: number;
  subscriberCount: number;
  videoCount: number;
  latestVideo: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    views: number;
  } | null;
  recentComments: RecentComment[];
}) {
  const {
    totalViews,
    subscriberCount,
    videoCount,
    latestVideo,
    recentComments,
  } = props;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total views
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
            {totalViews.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Subscribers
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
            {subscriberCount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Videos
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
            {videoCount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Latest upload</h2>
          {latestVideo ? (
            <Link
              href={`/watch/${latestVideo.id}`}
              className="mt-3 flex gap-3 no-underline hover:opacity-90"
            >
              <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-muted">
                {latestVideo.thumbnailUrl && (
                  <Image
                    src={latestVideo.thumbnailUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="160px"
                    unoptimized
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 font-medium text-ink">{latestVideo.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {latestVideo.views.toLocaleString()} views
                </p>
              </div>
            </Link>
          ) : (
            <p className="mt-3 text-sm text-secondary-foreground">No uploads yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Latest comments on your videos</h2>
          {recentComments.length === 0 ? (
            <p className="mt-3 text-sm text-secondary-foreground">No comments yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {recentComments.map((c) => (
                <li key={c.id} className="text-sm">
                  <p className="line-clamp-2 text-secondary-foreground">{c.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-ink">
                      {c.author.name ?? "Someone"}
                    </span>
                    {" · "}
                    <Link
                      href={`/watch/${c.video.id}`}
                      className="text-text-link hover:underline"
                    >
                      {c.video.title}
                    </Link>
                    {" · "}
                    {formatDistanceToNow(new Date(c.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
