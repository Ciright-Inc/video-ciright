"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/user-avatar";

interface CommentInputProps {
  videoId: string;
  parentId?: string;
  onPosted?: () => void;
}

export function CommentInput({ videoId, parentId, onPosted }: CommentInputProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }
    if (!body.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, body: body.trim(), parentId }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      setBody("");
      setFocused(false);
      onPosted?.();
      router.refresh();
    } catch {
      setError("Could not post comment. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex gap-4">
        <div className="mt-1 size-9 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="h-10 flex-1 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-text-link hover:text-text-link/80"
        >
          Sign in
        </button>{" "}
        to leave a comment.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <Avatar
        src={session.user.image}
        name={session.user.name}
        size="md"
        className="mt-1 shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Add a comment..."
          className={cn(
            "w-full border-0 border-b border-hairline bg-transparent py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-ink"
          )}
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
        {(focused || body.length > 0) && (
          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setBody("");
                setFocused(false);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading || !body.trim()}>
              Comment
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
