"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/ui/labeled-input";

const SAMPLE_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
];

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO_URL);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadToS3(file: File): Promise<string> {
    const presignRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      }),
    });

    const presignData = await presignRes.json();
    if (!presignRes.ok) {
      throw new Error(presignData.error ?? "Failed to prepare upload");
    }

    setUploadProgress("Uploading to S3…");

    const uploadRes = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("S3 upload failed");
    }

    return presignData.publicUrl as string;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUploadProgress(null);

    try {
      let finalVideoUrl = videoUrl;

      if (!useExternalUrl) {
        if (!videoFile) {
          throw new Error("Select a video file to upload");
        }
        finalVideoUrl = await uploadToS3(videoFile);
      } else if (!finalVideoUrl.trim()) {
        throw new Error("Video URL is required");
      }

      setUploadProgress("Saving video…");

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          visibility,
          videoUrl: finalVideoUrl,
          thumbnailUrl:
            thumbnailUrl || `https://picsum.photos/seed/${Date.now()}/640/360`,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      router.push(`/watch/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-4">
      <LabeledInput
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-[var(--radius-md)] border border-hairline bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={useExternalUrl}
            onChange={(e) => setUseExternalUrl(e.target.checked)}
            className="rounded border-hairline"
          />
          Use external video URL instead of S3 upload
        </label>

        {!useExternalUrl ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Video file</label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_VIDEO_TYPES.join(",")}
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
              className="text-sm text-ink file:mr-3 file:rounded-[var(--radius-md)] file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-on-primary"
            />
            {videoFile && (
              <p className="text-xs text-muted-foreground">
                {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Uploaded to S3 bucket <span className="font-mono">video-ciright</span> (mp4, webm, mov, mkv; max 500 MB)
            </p>
          </div>
        ) : (
          <LabeledInput
            label="Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            placeholder="https://... or .m3u8 for HLS"
          />
        )}
      </div>
      <LabeledInput
        label="Thumbnail URL (optional)"
        value={thumbnailUrl}
        onChange={(e) => setThumbnailUrl(e.target.value)}
        placeholder="https://..."
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Visibility</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="h-10 rounded-[var(--radius-md)] border border-hairline bg-surface-card px-3 text-sm text-ink"
        >
          <option value="PUBLIC">Public</option>
          <option value="UNLISTED">Unlisted</option>
          <option value="PRIVATE">Private</option>
        </select>
      </div>
      <LabeledInput
        label="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="tutorial, nextjs"
      />
      {uploadProgress && (
        <p className="text-xs text-muted-foreground">{uploadProgress}</p>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? uploadProgress ?? "Publishing…" : "Publish video"}
      </Button>
    </form>
  );
}
