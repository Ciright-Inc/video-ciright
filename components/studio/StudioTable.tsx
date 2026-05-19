"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatViews } from "@/lib/format";
import type { Video, Visibility, VideoStatus } from "@prisma/client";

type StudioVideo = Pick<
  Video,
  "id" | "title" | "thumbnailUrl" | "views" | "visibility" | "status" | "createdAt"
>;

interface StudioTableProps {
  videos: StudioVideo[];
}

export function StudioTable({ videos: initialVideos }: StudioTableProps) {
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);
  const [editing, setEditing] = useState<StudioVideo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVisibility, setEditVisibility] = useState<Visibility>("PUBLIC");
  const [loading, setLoading] = useState(false);

  function openEdit(video: StudioVideo) {
    setEditing(video);
    setEditTitle(video.title);
    setEditVisibility(video.visibility);
  }

  async function saveEdit() {
    if (!editing) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, visibility: editVisibility }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setVideos((v) =>
        v.map((item) =>
          item.id === editing.id
            ? { ...item, title: updated.title, visibility: updated.visibility }
            : item
        )
      );
      setEditing(null);
      router.refresh();
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
      <p className="py-12 text-center text-body">
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
                <td className="p-3 text-body">{video.visibility}</td>
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
                <td className="p-3 text-body">{formatViews(video.views)}</td>
                <td className="p-3 text-muted">
                  {formatDistanceToNow(new Date(video.createdAt), {
                    addSuffix: true,
                  })}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(video)}
                      disabled={loading}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/50 p-4">
          <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-hairline bg-surface-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-lg font-semibold text-ink">Edit video</h2>
            <div className="flex flex-col gap-4">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-10 rounded-[var(--radius-md)] border border-hairline px-3 text-sm"
              />
              <select
                value={editVisibility}
                onChange={(e) =>
                  setEditVisibility(e.target.value as Visibility)
                }
                className="h-10 rounded-[var(--radius-md)] border border-hairline px-3 text-sm"
              >
                <option value="PUBLIC">Public</option>
                <option value="UNLISTED">Unlisted</option>
                <option value="PRIVATE">Private</option>
              </select>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={saveEdit} disabled={loading}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

