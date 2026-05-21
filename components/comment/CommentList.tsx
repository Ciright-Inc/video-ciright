"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/user-avatar";
import { CommentInput } from "./CommentInput";
import { CommentLikeButtons } from "./CommentLikeButtons";
import type { CommentItem } from "./CommentsSection";

interface CommentListProps {
  videoId: string;
  comments: CommentItem[];
}

export function CommentList({ videoId, comments }: CommentListProps) {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No comments yet.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-6">
      {comments.map((comment) => (
        <li key={comment.id}>
          <CommentRow
            comment={comment}
            videoId={videoId}
            isReplying={replyingToId === comment.id}
            onReply={() =>
              setReplyingToId((id) => (id === comment.id ? null : comment.id))
            }
            onReplyDone={() => setReplyingToId(null)}
          />
          {comment.replies && comment.replies.length > 0 && (
            <ul className="ml-11 mt-4 flex flex-col gap-4">
              {comment.replies.map((reply) => (
                <li key={reply.id}>
                  <CommentRow comment={reply} videoId={videoId} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function CommentRow({
  comment,
  videoId,
  isReplying,
  onReply,
  onReplyDone,
}: {
  comment: CommentItem;
  videoId: string;
  isReplying?: boolean;
  onReply?: () => void;
  onReplyDone?: () => void;
}) {
  const displayName = comment.author.name ?? "Anonymous";
  const isTopLevel = Boolean(onReply);

  return (
    <article className="flex gap-3">
      <Avatar
        src={comment.author.image}
        name={comment.author.name}
        size="md"
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink">
          <span className="font-medium">
            @{displayName.replace(/\s+/g, "").toLowerCase()}
          </span>
          <span className="ml-2 text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </p>
        <p className="mt-1 text-sm text-body">{comment.body}</p>
        <div className="mt-1 flex items-center gap-1">
          <CommentLikeButtons
            commentId={comment.id}
            initialLikeCount={comment.likeCount ?? 0}
            initialDislikeCount={comment.dislikeCount ?? 0}
            initialUserValue={comment.userValue ?? 0}
          />
          {isTopLevel && onReply && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-1 h-8 text-xs text-muted-foreground"
              onClick={onReply}
            >
              Reply
            </Button>
          )}
        </div>
        {isReplying && onReplyDone && (
          <div className="mt-3">
            <CommentInput
              videoId={videoId}
              parentId={comment.id}
              onPosted={onReplyDone}
            />
          </div>
        )}
        {comment.replies && comment.replies.length > 0 && isTopLevel && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-2 h-auto p-0 text-xs text-text-link"
          >
            <ChevronDown className="mr-1 size-3.5" />
            {comment.replies.length} repl
            {comment.replies.length === 1 ? "y" : "ies"}
          </Button>
        )}
      </div>
    </article>
  );
}
