import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/user-avatar";
import type { CommentItem } from "./CommentsSection";

interface CommentListProps {
  comments: CommentItem[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No comments yet.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-6">
      {comments.map((comment) => (
        <li key={comment.id}>
          <CommentRow comment={comment} />
          {comment.replies && comment.replies.length > 0 && (
            <ul className="ml-11 mt-4 flex flex-col gap-4">
              {comment.replies.map((reply) => (
                <li key={reply.id}>
                  <CommentRow comment={reply} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function CommentRow({ comment }: { comment: CommentItem }) {
  const displayName = comment.author.name ?? "Anonymous";

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
          <span className="font-medium">@{displayName.replace(/\s+/g, "").toLowerCase()}</span>
          <span className="ml-2 text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </p>
        <p className="mt-1 text-sm text-body">{comment.body}</p>
        <div className="mt-1 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Like"
          >
            <ThumbsUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Dislike"
          >
            <ThumbsDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-1 h-8 text-xs text-muted-foreground"
          >
            Reply
          </Button>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-2 h-auto p-0 text-xs text-text-link"
          >
            <ChevronDown className="size-4" />
            {comment.replies.length} repl{comment.replies.length === 1 ? "y" : "ies"}
          </Button>
        )}
      </div>
    </article>
  );
}

