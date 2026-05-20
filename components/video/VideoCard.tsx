import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Avatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatViews } from "@/lib/format";
import type { VideoListItem } from "@/lib/data/videos";

interface VideoCardProps {
  video: VideoListItem;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <article className="group flex flex-col gap-3">
      <Link
        href={`/watch/${video.id}`}
        className="relative block overflow-hidden rounded-[var(--radius-lg)]"
      >
        <div className="relative aspect-video bg-surface-strong">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              unoptimized
            />
          )}
          {video.duration != null && (
            <span className="absolute bottom-2 right-2 rounded-[var(--radius-sm)] bg-surface-dark/80 px-1.5 py-0.5 text-xs font-medium text-on-dark">
              {formatDuration(video.duration)}
            </span>
          )}
          {video.isLive && (
            <span className="absolute left-2 top-2">
              <Badge variant="live">LIVE</Badge>
            </span>
          )}
        </div>
      </Link>

      <div className="flex gap-3">
        <Link href={`/channel/${video.channel.id}`}>
          <Avatar
            src={video.channel.avatarUrl}
            name={video.channel.name}
            size="md"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-primary">
              {video.title}
            </h3>
          </Link>
          <Link
            href={`/channel/${video.channel.id}`}
            className="mt-1 block text-sm text-body hover:text-ink"
          >
            {video.channel.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatViews(video.views)} ·{" "}
            {formatDistanceToNow(new Date(video.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </article>
  );
}
