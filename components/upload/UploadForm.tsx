"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/ui/labeled-input";

const SAMPLE_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [tags, setTags] = useState("");
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO_URL);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          visibility,
          videoUrl,
          thumbnailUrl: thumbnailUrl || `https://picsum.photos/seed/${Date.now()}/640/360`,
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
      <LabeledInput
        label="Video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        required
        placeholder="https://... or .m3u8 for HLS (Phase 2)"
      />
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
      <p className="text-xs text-muted">
        Phase 1 uses URL references. File upload + S3/R2 storage coming later.
      </p>
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Publishing..." : "Publish video"}
      </Button>
    </form>
  );
}
