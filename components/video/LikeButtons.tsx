"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface LikeButtonsProps {
  videoId: string;
  initialLikeCount: number;
  initialDislikeCount: number;
  initialUserValue: number;
}

export function LikeButtons({
  videoId,
  initialLikeCount,
  initialDislikeCount,
  initialUserValue,
}: LikeButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [userValue, setUserValue] = useState(initialUserValue);
  const [loading, setLoading] = useState(false);

  async function handleLike(value: 1 | -1) {
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
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, value: newValue }),
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
    <div className="flex items-center gap-1 rounded-[var(--radius-pill)] bg-muted p-0">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => handleLike(1)}
        className={cn(
          "rounded-l-[var(--radius-pill)] rounded-r-none px-4",
          userValue === 1 && "text-primary"
        )}
      >
        <ThumbsUp className="size-5" />
        {likeCount > 0 ? likeCount : null}
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => handleLike(-1)}
        className={cn(
          "rounded-l-none rounded-r-[var(--radius-pill)] px-4",
          userValue === -1 && "text-primary"
        )}
      >
        <ThumbsDown className="size-5" />
      </Button>
    </div>
  );
}
