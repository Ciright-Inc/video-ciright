"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { patchProfileChannelCache } from "@/lib/queries/profile-cache";
import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import { useObjectUrl } from "@/hooks/use-object-url";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type ChannelFormInitial = {
  name: string;
  handle: string;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

const AVATAR_MAX_BYTES = 10 * 1024 * 1024;
const BANNER_MAX_BYTES = 50 * 1024 * 1024;

async function uploadChannelAsset(
  file: File,
  assetType: "avatar" | "banner"
): Promise<string> {
  const formData = new FormData();
  formData.set("assetType", assetType);
  formData.set("file", file);

  const uploadRes = await fetch("/api/upload/channel-asset", {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Upload failed");
  }
  const uploadData = (await uploadRes.json()) as {
    publicUrl: string;
  };
  return uploadData.publicUrl;
}

function validateImageFile(
  file: File,
  maxBytes: number,
  sizeLabel: string
): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please choose an image file only";
  }
  if (file.size > maxBytes) {
    return `${sizeLabel} exceeds ${maxBytes / (1024 * 1024)} MB limit`;
  }
  return null;
}

export function ChannelForm({
  channelId,
  initial,
}: {
  channelId: string;
  initial: ChannelFormInitial;
}) {
  const queryClient = useQueryClient();
  const { update } = useSession();
  const [name, setName] = useState(initial.name);
  const [handle, setHandle] = useState(initial.handle);
  const [description, setDescription] = useState(initial.description ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(initial.bannerUrl ?? "");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null);
  const avatarObjectUrl = useObjectUrl(pendingAvatarFile);
  const bannerObjectUrl = useObjectUrl(pendingBannerFile);
  const avatarPreview = pendingAvatarFile
    ? (avatarObjectUrl ?? "")
    : avatarUrl;
  const bannerPreview = pendingBannerFile
    ? (bannerObjectUrl ?? "")
    : bannerUrl;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const bannerUploadRef = useRef<HTMLInputElement>(null);
  const avatarUploadRef = useRef<HTMLInputElement>(null);

  const isDirty =
    name.trim() !== initial.name ||
    handle.trim() !== initial.handle ||
    description.trim() !== (initial.description ?? "") ||
    pendingAvatarFile !== null ||
    pendingBannerFile !== null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let nextAvatarUrl = avatarUrl.trim() || null;
      let nextBannerUrl = bannerUrl.trim() || null;

      if (pendingAvatarFile) {
        nextAvatarUrl = await uploadChannelAsset(pendingAvatarFile, "avatar");
      }
      if (pendingBannerFile) {
        nextBannerUrl = await uploadChannelAsset(pendingBannerFile, "banner");
      }

      const res = await fetch(`/api/channels/${channelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          handle: handle.trim(),
          description: description.trim() || null,
          avatarUrl: nextAvatarUrl,
          bannerUrl: nextBannerUrl,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Save failed");
      }

      setAvatarUrl(nextAvatarUrl ?? "");
      setBannerUrl(nextBannerUrl ?? "");
      setPendingAvatarFile(null);
      setPendingBannerFile(null);
      patchProfileChannelCache(queryClient, {
        name: name.trim(),
        handle: handle.trim(),
        description: description.trim() || null,
        avatarUrl: nextAvatarUrl,
        bannerUrl: nextBannerUrl,
      });
      await update();
      toast.success("Channel settings saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function onAvatarChange(file: File | undefined) {
    if (!file) return;
    const message = validateImageFile(file, AVATAR_MAX_BYTES, "Avatar");
    if (message) {
      setError(message);
      toast.error(message);
      return;
    }
    setError("");
    setPendingAvatarFile(file);
    if (avatarUploadRef.current) avatarUploadRef.current.value = "";
  }

  function onBannerChange(file: File | undefined) {
    if (!file) return;
    const message = validateImageFile(file, BANNER_MAX_BYTES, "Banner");
    if (message) {
      setError(message);
      toast.error(message);
      return;
    }
    setError("");
    setPendingBannerFile(file);
    if (bannerUploadRef.current) bannerUploadRef.current.value = "";
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-foreground">Channel settings</h2>
          <p className="text-sm text-secondary-foreground">Manage your brand identity and public profile.</p>
        </div>
        <Button
          type="submit"
          disabled={saving || !isDirty}
          className="h-11 px-5 text-sm font-semibold shadow-sm transition-colors hover:bg-primary/90 md:h-10 md:min-w-40"
        >
          {saving ? (
            <>
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-foreground">Branding</h3>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="relative h-32 w-full bg-muted sm:h-48">
            {bannerPreview ? (
              <Image
                src={bannerPreview}
                alt="Banner preview"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-secondary-foreground">
                Banner preview
              </div>
            )}
            <div className="absolute -bottom-12 left-6 rounded-full border-4 border-card bg-muted shadow-sm">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  width={96}
                  height={96}
                  unoptimized
                  className="size-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-full text-xs font-medium text-secondary-foreground">
                  Avatar
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 px-6 pb-6 pt-16 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground">Banner image</p>
              <p className="text-sm text-secondary-foreground">
                Use at least 2048 x 1152 pixels. Maximum file size: 50MB. Changes
                apply when you save.
              </p>
              <input
                ref={bannerUploadRef}
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={saving}
                onChange={(e) => onBannerChange(e.target.files?.[0])}
              />
              <Button
                type="button"
                className="h-[34px] w-fit cursor-pointer rounded-lg border border-primary bg-background px-4 text-sm font-medium text-primary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                onClick={() => bannerUploadRef.current?.click()}
              >
                Upload New
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground">Avatar image</p>
              <p className="text-sm text-secondary-foreground">
                Recommended: 800 x 800 pixels. Maximum file size: 10MB. Changes apply
                when you save.
              </p>
              <input
                ref={avatarUploadRef}
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={saving}
                onChange={(e) => onAvatarChange(e.target.files?.[0])}
              />
              <Button
                type="button"
                className="h-[34px] w-fit cursor-pointer rounded-lg border border-primary bg-background px-4 text-sm font-medium text-primary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                onClick={() => avatarUploadRef.current?.click()}
              >
                Upload New
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-foreground">Basic info</h3>
        <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="channel-name" className="text-sm font-medium text-foreground">
                Channel name
              </label>
              <Input
                id="channel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-[34px] rounded-md"
                required
                disabled={saving}
              />
              <p className="text-sm text-secondary-foreground">
                Choose a name that represents you and your content.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="channel-handle" className="text-sm font-medium text-foreground">
                Handle
              </label>
              <div className="flex items-center rounded-md border border-input bg-background">
                <span className="px-3 text-sm text-secondary-foreground">@</span>
                <Input
                  id="channel-handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0"
                  required
                  disabled={saving}
                />
              </div>
              <p className="text-sm text-secondary-foreground">Your unique identifier on the platform.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="channel-desc" className="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              id="channel-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="Tell viewers about your channel..."
              disabled={saving}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-secondary-foreground">Tell your fans what your channel is about.</p>
              <span className="text-sm text-secondary-foreground">{description.length} / 1000</span>
            </div>
          </div>
        </div>
      </section>
    </form>
  );
}
