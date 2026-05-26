"use client";

import { LikeButtons } from "./LikeButtons";
import { SaveButton } from "./SaveButton";
import { ShareMenu } from "./ShareMenu";

interface VideoActionBarProps {
  videoId: string;
  title: string;
  likeCount: number;
  dislikeCount: number;
  userLikeValue: number;
  initialSaved: boolean;
}

export function VideoActionBar({
  videoId,
  title,
  likeCount,
  dislikeCount,
  userLikeValue,
  initialSaved,
}: VideoActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <LikeButtons
        videoId={videoId}
        initialLikeCount={likeCount}
        initialDislikeCount={dislikeCount}
        initialUserValue={userLikeValue}
      />
      <ShareMenu videoId={videoId} title={title} />
      <SaveButton videoId={videoId} initialSaved={initialSaved} />
    </div>
  );
}
