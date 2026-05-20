"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/ui/labeled-input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ChannelFormInitial = {
  name: string;
  handle: string;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

async function uploadChannelAsset(
  file: File,
  assetType: "avatar" | "banner"
): Promise<string> {
  const presignRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "channel-asset",
      assetType,
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });
  if (!presignRes.ok) {
    const err = await presignRes.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Presign failed");
  }
  const presignData = (await presignRes.json()) as {
    uploadUrl: string;
    publicUrl: string;
  };
  const uploadRes = await fetch(presignData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadRes.ok) throw new Error("Upload failed");
  return presignData.publicUrl;
}

export function ChannelForm({
  channelId,
  initial,
}: {
  channelId: string;
  initial: ChannelFormInitial;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(initial.name);
  const [handle, setHandle] = useState(initial.handle);
  const [description, setDescription] = useState(initial.description ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(initial.bannerUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/channels/${channelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          handle: handle.trim(),
          description: description.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
          bannerUrl: bannerUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Save failed");
      }
      await update();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function onAvatarChange(file: File | undefined) {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const url = await uploadChannelAsset(file, "avatar");
      setAvatarUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Avatar upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function onBannerChange(file: File | undefined) {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const url = await uploadChannelAsset(file, "banner");
      setBannerUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Banner upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-6">
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <LabeledInput
        label="Channel name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <LabeledInput
        label="Handle"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="yourhandle"
        required
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="channel-desc" className="text-sm font-medium text-foreground">
          Description
        </label>
        <Textarea
          id="channel-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Tell viewers about your channel"
        />
      </div>

      <LabeledInput
        label="Avatar URL (or upload)"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        placeholder="https://..."
      />
      <div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={cn("text-sm text-body")}
          disabled={loading}
          onChange={(e) => void onAvatarChange(e.target.files?.[0])}
        />
      </div>

      <LabeledInput
        label="Banner URL (or upload)"
        value={bannerUrl}
        onChange={(e) => setBannerUrl(e.target.value)}
        placeholder="https://..."
      />
      <div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={cn("text-sm text-body")}
          disabled={loading}
          onChange={(e) => void onBannerChange(e.target.files?.[0])}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
