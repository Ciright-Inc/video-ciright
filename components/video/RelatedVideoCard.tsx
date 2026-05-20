import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { formatDuration, formatViews } from "@/lib/format";
import type { VideoListItem } from "@/lib/data/videos";

interface RelatedVideoCardProps {
  video: VideoListItem;
  /** When set, used for the time line instead of the video's publish date */
  contextDate?: string | Date;
}

export function RelatedVideoCard({ video, contextDate }: RelatedVideoCardProps) {
  return (
    <article className="group flex gap-2">
      <Link
        href={`/watch/${video.id}`}
        className="relative block w-[168px] shrink-0 overflow-hidden rounded-[var(--radius-md)]"
      >
        <div className="relative aspect-video bg-surface-strong">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt=""
              fill
              className="object-cover"
              sizes="168px"
              unoptimized
            />
          )}
          {video.duration != null && (
            <span className="absolute bottom-1 right-1 rounded-[var(--radius-xs)] bg-surface-dark/90 px-1 py-0.5 text-[11px] font-medium tabular-nums text-on-dark">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
      </Link>

      <div className="relative min-w-0 flex-1 pr-6">
        <Link href={`/watch/${video.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink group-hover:text-primary">
            {video.title}
          </h3>
        </Link>
        <Link
          href={`/channel/${video.channel.id}`}
          className="mt-1 block truncate text-xs text-body hover:text-ink"
        >
          {video.channel.name}
        </Link>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {formatViews(video.views)} ·{" "}
          {formatDistanceToNow(new Date(contextDate ?? video.createdAt), {
            addSuffix: true,
          })}
        </p>

        <button
          type="button"
          aria-label="More actions"
          className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-surface-soft hover:text-ink group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <MoreIcon />
        </button>
      </div>
    </article>
  );
}

function MoreIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}
