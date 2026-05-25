"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ClockIcon, FlameIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CommentList } from "./CommentList";
import { CommentInput } from "./CommentInput";

interface CommentAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

export interface CommentItem {
  id: string;
  body: string;
  createdAt: Date;
  author: CommentAuthor;
  likeCount?: number;
  dislikeCount?: number;
  userValue?: number;
  replies?: CommentItem[];
}

type SortOption = "top" | "newest";

const SORT_OPTIONS: {
  value: SortOption;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "top", label: "Top comments", icon: FlameIcon },
  { value: "newest", label: "Newest first", icon: ClockIcon },
];

function getSortOption(value: string | null | undefined) {
  return SORT_OPTIONS.find((option) => option.value === value);
}

function SortOptionLabel({
  icon: Icon,
  label,
  compact = false,
}: {
  icon: LucideIcon;
  label: string;
  compact?: boolean;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary",
          compact ? "size-6" : "size-7"
        )}
      >
        <Icon />
      </span>
      <span className="text-sm font-medium text-ink">{label}</span>
    </span>
  );
}

interface CommentsSectionProps {
  videoId: string;
  comments: CommentItem[];
}

export function CommentsSection({ videoId, comments }: CommentsSectionProps) {
  const [sort, setSort] = useState<SortOption>("top");
  const selectedSort = getSortOption(sort);

  const sorted = useMemo(() => {
    const copy = [...comments];
    if (sort === "newest") {
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return copy;
  }, [comments, sort]);

  return (
    <section className="mt-6">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h2 className="text-xl font-semibold text-ink">
          {comments.length} Comment{comments.length === 1 ? "" : "s"}
        </h2>
        <div className="flex items-center gap-2 sm:ml-auto">
          <span
            id="comment-sort-label"
            className="text-sm text-muted-foreground"
          >
            Sort
          </span>
          <Select
            value={sort}
            onValueChange={(value) => value && setSort(value as SortOption)}
          >
            <SelectTrigger
              size="sm"
              aria-labelledby="comment-sort-label"
              className="h-9 min-h-9 min-w-48 gap-2 border-border/70 bg-surface-soft/70 px-2.5 shadow-none hover:bg-surface-soft data-popup-open:bg-surface-soft dark:bg-input/20"
            >
              <SelectValue placeholder="Sort comments">
                {selectedSort ? (
                  <SortOptionLabel
                    icon={selectedSort.icon}
                    label={selectedSort.label}
                    compact
                  />
                ) : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              align="end"
              alignItemWithTrigger={false}
              sideOffset={6}
              className="min-w-52 p-1"
            >
              {SORT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="min-h-10 py-2 pr-9 pl-1.5"
                >
                  <SortOptionLabel icon={option.icon} label={option.label} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <CommentInput videoId={videoId} />
      <div className="mt-6">
        <CommentList videoId={videoId} comments={sorted} />
      </div>
    </section>
  );
}
