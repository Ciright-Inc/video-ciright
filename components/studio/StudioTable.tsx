"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ImagePlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TagsInput } from "@/components/ui/tags-input";
import { Textarea } from "@/components/ui/textarea";
import {
  VISIBILITY_OPTIONS,
  VisibilitySelect,
} from "@/components/upload/VisibilitySelect";
import { formatViews } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Video, Visibility } from "@prisma/client";

const TITLE_MAX = 100;
const DESC_MAX = 5000;
const THUMBNAIL_MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

function visibilityLabel(value: Visibility) {
  return (
    VISIBILITY_OPTIONS.find((opt) => opt.value === value)?.label ?? value
  );
}

type StudioVideo = Pick<
  Video,
  | "id"
  | "title"
  | "description"
  | "thumbnailUrl"
  | "views"
  | "visibility"
  | "status"
  | "createdAt"
> & {
  tags: string[];
};

interface StudioTableProps {
  videos: StudioVideo[];
}

async function uploadThumbnail(
  file: File,
  videoId: string
): Promise<string> {
  const form = new FormData();
  form.set("kind", "thumbnail");
  form.set("videoId", videoId);
  form.set("file", file);

  const res = await fetch("/api/upload/file", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as {
    publicUrl?: string;
    error?: string;
  };
  if (!res.ok || !data.publicUrl) {
    throw new Error(data.error ?? "Thumbnail upload failed");
  }
  return data.publicUrl;
}

export function StudioTable({ videos: initialVideos }: StudioTableProps) {
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);
  const [editing, setEditing] = useState<StudioVideo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editVisibility, setEditVisibility] = useState<Visibility>("PUBLIC");
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    null
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  function revokePreviewObjectUrl() {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
  }

  function openEdit(video: StudioVideo) {
    revokePreviewObjectUrl();
    setEditing(video);
    setEditTitle(video.title);
    setEditDescription(video.description ?? "");
    setEditTags(video.tags);
    setEditVisibility(video.visibility);
    setThumbnailPreviewUrl(video.thumbnailUrl);
    setThumbnailFile(null);
  }

  function closeEdit() {
    revokePreviewObjectUrl();
    setEditing(null);
    setThumbnailFile(null);
  }

  function handleThumbnailChange(file: File | null) {
    if (!file) return;
    if (file.size > THUMBNAIL_MAX_BYTES) {
      toast.error("Thumbnail must be 10 MB or smaller");
      return;
    }
    revokePreviewObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setThumbnailPreviewUrl(objectUrl);
    setThumbnailFile(file);
  }

  async function saveEdit() {
    if (!editing) return;
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    try {
      let thumbnailUrl: string | undefined;
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(thumbnailFile, editing.id);
      }

      const res = await fetch(`/api/videos/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle.slice(0, TITLE_MAX),
          description: editDescription.slice(0, DESC_MAX) || null,
          visibility: editVisibility,
          tags: editTags,
          ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Failed to save");
      }
      const updated = (await res.json()) as StudioVideo;
      setVideos((v) =>
        v.map((item) =>
          item.id === editing.id
            ? {
                ...item,
                title: updated.title,
                description: updated.description,
                visibility: updated.visibility,
                thumbnailUrl: updated.thumbnailUrl,
                tags: updated.tags ?? editTags,
              }
            : item
        )
      );
      closeEdit();
      router.refresh();
      toast.success("Video updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function deleteVideo(id: string) {
    if (!confirm("Delete this video?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setVideos((v) => v.filter((item) => item.id !== id));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (videos.length === 0) {
    return (
      <p className="py-12 text-center text-secondary-foreground">
        No videos yet.{" "}
        <Link href="/upload" className="text-text-link">
          Upload your first video
        </Link>
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-hairline">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-surface-soft">
            <tr>
              <th className="p-3 font-medium text-ink">Video</th>
              <th className="p-3 font-medium text-ink">Visibility</th>
              <th className="p-3 font-medium text-ink">Status</th>
              <th className="p-3 font-medium text-ink">Views</th>
              <th className="p-3 font-medium text-ink">Date</th>
              <th className="p-3 font-medium text-ink">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id} className="border-b border-hairline-soft">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-strong">
                      {video.thumbnailUrl && (
                        <Image
                          src={video.thumbnailUrl}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                    <Link
                      href={`/watch/${video.id}`}
                      className="line-clamp-2 font-medium text-ink hover:text-primary"
                    >
                      {video.title}
                    </Link>
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="font-normal">
                    {visibilityLabel(video.visibility)}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge
                    variant={
                      video.status === "READY"
                        ? "default"
                        : video.status === "PROCESSING"
                          ? "processing"
                          : "warning"
                    }
                  >
                    {video.status}
                  </Badge>
                </td>
                <td className="p-3 text-secondary-foreground">{formatViews(video.views)}</td>
                <td className="p-3 text-muted-foreground">
                  {formatDistanceToNow(new Date(video.createdAt), {
                    addSuffix: true,
                  })}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(video)}
                      disabled={loading}
                      className="border-hairline bg-surface-soft text-ink hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteVideo(video.id)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/50 p-4"
          role="presentation"
          onClick={() => !loading && closeEdit()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-edit-title"
            className="flex max-h-[min(90dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface-card shadow-[var(--shadow-card)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-hairline px-6 py-4">
              <h2
                id="studio-edit-title"
                className="text-lg font-semibold text-ink"
              >
                Edit video
              </h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="studio-edit-video-title">Title</FieldLabel>
                  <div className="relative">
                    <Input
                      id="studio-edit-video-title"
                      value={editTitle}
                      onChange={(e) =>
                        setEditTitle(e.target.value.slice(0, TITLE_MAX))
                      }
                      disabled={loading}
                      className="h-10 pr-14"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                      {editTitle.length}/{TITLE_MAX}
                    </span>
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="studio-edit-description">
                    Description
                  </FieldLabel>
                  <div className="relative">
                    <Textarea
                      id="studio-edit-description"
                      value={editDescription}
                      onChange={(e) =>
                        setEditDescription(e.target.value.slice(0, DESC_MAX))
                      }
                      placeholder="Tell viewers about your video"
                      rows={4}
                      disabled={loading}
                      className="min-h-[100px] resize-none pb-7"
                    />
                    <span className="pointer-events-none absolute right-3 bottom-2 text-xs text-muted-foreground">
                      {editDescription.length}/{DESC_MAX}
                    </span>
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="studio-edit-tags">Tags</FieldLabel>
                  <TagsInput
                    id="studio-edit-tags"
                    value={editTags}
                    onChange={setEditTags}
                    disabled={loading}
                    placeholder="tutorial, nextjs, design"
                  />
                  <FieldDescription>
                    Press Enter or comma to add a tag.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="studio-edit-visibility">
                    Who can watch
                  </FieldLabel>
                  <VisibilitySelect
                    id="studio-edit-visibility"
                    value={editVisibility}
                    onValueChange={(v) => setEditVisibility(v as Visibility)}
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <FieldLabel>Thumbnail</FieldLabel>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    className="sr-only"
                    disabled={loading}
                    onChange={(e) => {
                      handleThumbnailChange(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                  />
                  <div
                    className={cn(
                      "relative aspect-video overflow-hidden rounded-[var(--radius-md)]",
                      thumbnailPreviewUrl
                        ? "border border-hairline"
                        : "border-2 border-dashed border-hairline bg-surface-soft"
                    )}
                  >
                    {thumbnailPreviewUrl ? (
                      <>
                        <Image
                          src={thumbnailPreviewUrl}
                          alt="Thumbnail preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <div className="absolute right-2 bottom-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => thumbnailInputRef.current?.click()}
                            disabled={loading}
                          >
                            Change
                          </Button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="flex size-full flex-col items-center justify-center gap-2 p-4 transition-colors hover:bg-surface-strong/50"
                        onClick={() => thumbnailInputRef.current?.click()}
                        disabled={loading}
                      >
                        <ImagePlusIcon className="size-6 text-muted-foreground" />
                        <span className="text-sm font-medium text-ink">
                          Upload thumbnail
                        </span>
                        <span className="text-xs text-muted-foreground">
                          16:9 image, max 10 MB
                        </span>
                      </button>
                    )}
                  </div>
                </Field>
              </FieldGroup>
            </div>
            <div className="flex justify-end gap-2 border-t border-hairline px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                onClick={closeEdit}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="button" onClick={saveEdit} disabled={loading}>
                {loading ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
