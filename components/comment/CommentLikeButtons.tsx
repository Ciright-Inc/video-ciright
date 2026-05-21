"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommentLikeButtonsProps {
  commentId: string;
  initialLikeCount: number;
  initialDislikeCount: number;
  initialUserValue: number;
}

export function CommentLikeButtons({
  commentId,
  initialLikeCount,
  initialDislikeCount,
  initialUserValue,
}: CommentLikeButtonsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [userValue, setUserValue] = useState(initialUserValue);
  const [loading, setLoading] = useState(false);

  async function handleLike(value: 1 | -1) {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const prev = { likeCount, dislikeCount, userValue };

    const newValue = userValue === value ? 0 : value;
    let newLikes = likeCount;
    let newDislikes = dislikeCount;

    if (userValue === 1) newLikes--;
    if (userValue === -1) newDislikes--;
    if (newValue === 1) newLikes++;
    if (newValue === -1) newDislikes++;

    setUserValue(newValue);
    setLikeCount(newLikes);
    setDislikeCount(newDislikes);

    try {
      const res = await fetch("/api/comment-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, value: newValue }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLikeCount(data.likeCount);
      setDislikeCount(data.dislikeCount);
      setUserValue(data.userValue);
    } catch {
      setLikeCount(prev.likeCount);
      setDislikeCount(prev.dislikeCount);
      setUserValue(prev.userValue);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        loading && "opacity-70"
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={loading || status === "loading"}
        onClick={() => handleLike(1)}
        aria-label="Like comment"
        className={cn(userValue === 1 && "text-primary")}
      >
        <ThumbsUp className="size-4" />
        {likeCount > 0 && (
          <span className="ml-0.5 text-xs tabular-nums">{likeCount}</span>
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={loading || status === "loading"}
        onClick={() => handleLike(-1)}
        aria-label="Dislike comment"
        className={cn(userValue === -1 && "text-primary")}
      >
        <ThumbsDown className="size-4" />
      </Button>
    </div>
  );
}
