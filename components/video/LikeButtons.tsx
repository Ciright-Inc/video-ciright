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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(initialLikeCount ?? 0);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount ?? 0);
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

  const pillButtonClass =
    "h-auto cursor-pointer gap-1.5 rounded-none px-3 py-2 text-sm font-medium [&_svg]:size-5";

  return (
    <div
      className={cn(
        "flex items-stretch rounded-[var(--radius-pill)] bg-muted transition-opacity",
        loading && "opacity-70"
      )}
    >
      <Button
        type="button"
        variant="ghost"
        disabled={loading || status === "loading"}
        onClick={() => handleLike(1)}
        className={cn(
          pillButtonClass,
          "rounded-l-[var(--radius-pill)]",
          userValue === 1 && "text-primary"
        )}
      >
        <ThumbsUp />
        <span className="tabular-nums">{likeCount}</span>
      </Button>
      <Separator
        orientation="vertical"
        className="my-2 !w-0.5 self-stretch rounded-full bg-hairline-strong"
      />
      <Button
        type="button"
        variant="ghost"
        disabled={loading || status === "loading"}
        onClick={() => handleLike(-1)}
        className={cn(
          pillButtonClass,
          "rounded-r-[var(--radius-pill)]",
          userValue === -1 && "text-primary"
        )}
      >
        <ThumbsDown />
        <span className="tabular-nums">{dislikeCount}</span>
      </Button>
    </div>
  );
}
