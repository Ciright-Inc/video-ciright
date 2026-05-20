"use client";

import { useMemo, useState } from "react";
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
  replies?: CommentItem[];
}

type SortOption = "top" | "newest";

interface CommentsSectionProps {
  videoId: string;
  comments: CommentItem[];
}

export function CommentsSection({ videoId, comments }: CommentsSectionProps) {
  const [sort, setSort] = useState<SortOption>("top");

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
      <div className="mb-6 flex flex-wrap items-center gap-6">
        <h2 className="text-xl font-semibold text-ink">
          {comments.length} Comment{comments.length === 1 ? "" : "s"}
        </h2>
        <label className="flex items-center gap-2 text-sm text-ink">
          <span className="sr-only">Sort comments</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="cursor-pointer appearance-none rounded-md bg-transparent pr-6 text-sm font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23717171'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right center",
              backgroundSize: "1rem",
            }}
          >
            <option value="top">Top comments</option>
            <option value="newest">Newest first</option>
          </select>
        </label>
      </div>

      <CommentInput videoId={videoId} />
      <div className="mt-6">
        <CommentList comments={sorted} />
      </div>
    </section>
  );
}
