"use client";

import { useEffect, useState } from "react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { VideoStatus } from "@prisma/client";

type WatchPlayerSectionProps = {
  videoId: string;
  initialStatus: VideoStatus;
  src: string;
  poster?: string | null;
  isOwner?: boolean;
};

const POLL_INTERVAL_MS = 4000;

export function WatchPlayerSection({
  videoId,
  initialStatus,
  src,
  poster,
  isOwner,
}: WatchPlayerSectionProps) {
  const [status, setStatus] = useState(initialStatus);
  const [playbackUrl, setPlaybackUrl] = useState(src);

  useEffect(() => {
    setStatus(initialStatus);
    setPlaybackUrl(src);
  }, [initialStatus, src]);

  useEffect(() => {
    if (status !== "PROCESSING") return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/videos/${videoId}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          status?: VideoStatus;
          videoUrl?: string;
        };
        if (cancelled) return;
        if (data.status === "READY" && data.videoUrl) {
          setStatus("READY");
          setPlaybackUrl(data.videoUrl);
        } else if (data.status === "FAILED") {
          setStatus("FAILED");
        }
      } catch {
        /* retry on next interval */
      }
    };

    void poll();
    const id = setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [status, videoId]);

  if (status === "PROCESSING") {
    return (
      <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[var(--radius-lg)] bg-surface-dark px-6 text-center">
        <Spinner className="text-on-dark" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-on-dark">
            Processing your video
          </p>
          <p className="max-w-md text-xs text-on-dark-soft">
            {isOwner
              ? "We're converting your upload to adaptive streaming. This page will refresh automatically when it's ready."
              : "This video is still being processed. Check back in a few minutes."}
          </p>
        </div>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <Alert variant="destructive" className="aspect-video flex flex-col justify-center rounded-[var(--radius-lg)]">
        <AlertTitle>Processing failed</AlertTitle>
        <AlertDescription>
          {isOwner
            ? "Your video could not be converted for streaming. Try uploading again or contact support."
            : "This video is temporarily unavailable."}
        </AlertDescription>
      </Alert>
    );
  }

  return <VideoPlayer src={playbackUrl} poster={poster} />;
}
