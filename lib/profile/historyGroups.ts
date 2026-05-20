import { format, isThisWeek, isToday, isYesterday } from "date-fns";
import type { VideoListItem } from "@/lib/data/videos";

export type WatchHistoryRow = {
  watchedAt: Date;
  video: VideoListItem;
};

export function labelHistoryBucket(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date, { weekStartsOn: 1 })) return "This week";
  return format(date, "MMMM d, yyyy");
}

/** Preserves watch order; starts a new section when the day-bucket label changes. */
export function groupWatchHistory(rows: WatchHistoryRow[]) {
  const sections: { label: string; rows: WatchHistoryRow[] }[] = [];
  let currentLabel = "";
  for (const row of rows) {
    const label = labelHistoryBucket(new Date(row.watchedAt));
    if (label !== currentLabel) {
      currentLabel = label;
      sections.push({ label, rows: [row] });
    } else {
      sections[sections.length - 1]!.rows.push(row);
    }
  }
  return sections;
}
