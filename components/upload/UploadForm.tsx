"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createId } from "@paralleldrive/cuid2";
import type { VideoStatus } from "@prisma/client";
import {
  CirclePlayIcon,
  ImagePlusIcon,
  InfoIcon,
  VideoIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TagsInput } from "@/components/ui/tags-input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VisibilitySelect } from "@/components/upload/VisibilitySelect";
import { captureVideoThumbnail } from "@/lib/capture-video-thumbnail";
import { probeVideoDuration } from "@/lib/probe-video-duration";
import { cn } from "@/lib/utils";
import {
  UploadProgressPanel,
  type UploadStep,
} from "@/components/upload/UploadProgressPanel";

const VIDEO_MAX_BYTES = 1024 * 1024 * 1024;
const THUMBNAIL_MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

const SAMPLE_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
];

const TITLE_MAX = 100;
const DESC_MAX = 5000;
const DRAFT_KEY = "upload-video-draft";
const VIDEO_READY_POLL_INTERVAL_MS = 5000;
const VIDEO_READY_TIMEOUT_MS = 30 * 60 * 1000;

type VideoStatusResponse = {
  status?: VideoStatus;
  videoUrl?: string;
  error?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExtension(name: string): string {
  const ext = name.split(".").pop();
  return ext ? ext.toUpperCase() : "VIDEO";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForVideoReady(videoId: string): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < VIDEO_READY_TIMEOUT_MS) {
    const res = await fetch(`/api/videos/${videoId}`, { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as VideoStatusResponse;

    if (!res.ok) {
      throw new Error(data.error ?? "Could not check video processing status");
    }

    if (data.status === "READY") return;
    if (data.status === "FAILED") {
      throw new Error(
        "Your video could not be converted for streaming. Try uploading again."
      );
    }

    await wait(VIDEO_READY_POLL_INTERVAL_MS);
  }

  throw new Error("Video processing is taking longer than expected.");
}

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [tags, setTags] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO_URL);
  const [customThumbnailFile, setCustomThumbnailFile] = useState<File | null>(
    null
  );
  const [autoThumbnailBlob, setAutoThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    null
  );
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [uploadStep, setUploadStep] = useState<UploadStep | null>(null);
  const [fileUploadPercent, setFileUploadPercent] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as {
        title?: string;
        description?: string;
        visibility?: string;
        tags?: string | string[];
        useExternalUrl?: boolean;
        videoUrl?: string;
      };
      if (draft.title) setTitle(draft.title);
      if (draft.description) setDescription(draft.description);
      if (draft.visibility) setVisibility(draft.visibility);
      if (draft.tags) {
        setTags(
          Array.isArray(draft.tags)
            ? draft.tags
            : draft.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
        );
      }
      if (draft.useExternalUrl) setUseExternalUrl(draft.useExternalUrl);
      if (draft.videoUrl) setVideoUrl(draft.videoUrl);
    } catch {
      /* ignore corrupt draft */
    }
  }, []);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(url);
    setIsPreviewPlaying(false);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  function togglePreviewPlayback() {
    const video = videoPreviewRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }

  function setThumbnailPreviewFromBlob(blob: Blob) {
    setThumbnailPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
  }

  function setThumbnailPreviewFromFile(file: File) {
    setThumbnailPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function clearThumbnailPreview() {
    setThumbnailPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  async function generateThumbnailFromVideo(file: File) {
    setGeneratingThumbnail(true);
    try {
      const blob = await captureVideoThumbnail(file);
      setAutoThumbnailBlob(blob);
      setCustomThumbnailFile(null);
      setThumbnailPreviewFromBlob(blob);
    } catch {
      setAutoThumbnailBlob(null);
      clearThumbnailPreview();
      toast.error("Could not generate thumbnail from video");
    } finally {
      setGeneratingThumbnail(false);
    }
  }

  async function handleVideoFileChange(file: File | null) {
    setCustomThumbnailFile(null);
    setAutoThumbnailBlob(null);
    if (!file) {
      setVideoFile(null);
      setVideoDuration(null);
      clearThumbnailPreview();
      return;
    }
    if (file.size > VIDEO_MAX_BYTES) {
      toast.error("Video must be 1 GB or smaller");
      return;
    }
    setError("");
    setVideoFile(file);
    void probeVideoDuration(file).then(setVideoDuration);
    await generateThumbnailFromVideo(file);
  }

  function handleCustomThumbnailChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > THUMBNAIL_MAX_BYTES) {
      toast.error("Thumbnail must be 10 MB or smaller");
      return;
    }
    setCustomThumbnailFile(file);
    setThumbnailPreviewFromFile(file);
  }

  async function restoreVideoFrameThumbnail() {
    if (!videoFile) {
      setCustomThumbnailFile(null);
      clearThumbnailPreview();
      return;
    }
    setCustomThumbnailFile(null);
    await generateThumbnailFromVideo(videoFile);
  }

  function saveDraft() {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        title,
        description,
        visibility,
        tags,
        useExternalUrl,
        videoUrl,
      })
    );
    toast.success("Draft saved");
  }

  async function resolveThumbnailForUpload(): Promise<File> {
    if (customThumbnailFile) {
      return customThumbnailFile;
    }

    if (videoFile) {
      const blob =
        autoThumbnailBlob ?? (await captureVideoThumbnail(videoFile));
      return new File([blob], `thumbnail-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
    }

    if (useExternalUrl && videoUrl.trim()) {
      try {
        const blob = await captureVideoThumbnail(videoUrl.trim());
        return new File([blob], `thumbnail-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
      } catch {
        throw new Error(
          "Could not capture thumbnail from external URL. Upload a video file or add a custom thumbnail."
        );
      }
    }

    throw new Error("Add a video or upload a thumbnail image");
  }

  async function getPresignedUpload(
    file: File,
    kind: "video" | "thumbnail",
    videoId: string
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    const res = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        kind,
        videoId,
      }),
    });

    const data = (await res.json()) as {
      uploadUrl?: string;
      publicUrl?: string;
      key?: string;
      error?: string;
    };

    if (!res.ok || !data.uploadUrl || !data.publicUrl || !data.key) {
      throw new Error(data.error ?? "Failed to prepare upload");
    }

    return {
      uploadUrl: data.uploadUrl,
      publicUrl: data.publicUrl,
      key: data.key,
    };
  }

  function uploadToPresignedUrl(
    file: File,
    uploadUrl: string,
    onProgress: (percent: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.addEventListener("progress", (event) => {
        if (!event.lengthComputable) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
          return;
        }

        reject(new Error(`Upload failed (${xhr.status || "network error"})`));
      });

      xhr.addEventListener("error", () =>
        reject(
          new Error(
            "Network error while uploading. Check your connection and try again."
          )
        )
      );
      xhr.addEventListener("abort", () =>
        reject(new Error("Upload was cancelled"))
      );

      xhr.send(file);
    });
  }

  async function uploadToPresignedUrlWithRetry(
    file: File,
    uploadUrl: string,
    onProgress: (percent: number) => void
  ): Promise<void> {
    try {
      await uploadToPresignedUrl(file, uploadUrl, onProgress);
    } catch (firstError) {
      onProgress(0);
      try {
        await uploadToPresignedUrl(file, uploadUrl, onProgress);
      } catch {
        throw firstError;
      }
    }
  }

  async function uploadToStorage(
    file: File,
    kind: "video" | "thumbnail",
    videoId: string,
    step: Extract<UploadStep, "uploading-video" | "uploading-thumbnail">,
    onProgress: (percent: number) => void,
    options?: { syncStep?: boolean }
  ): Promise<{ publicUrl: string; key: string }> {
    if (options?.syncStep !== false) {
      setUploadStep(step);
    }
    onProgress(0);

    const { uploadUrl, publicUrl, key } = await getPresignedUpload(
      file,
      kind,
      videoId
    );
    await uploadToPresignedUrlWithRetry(file, uploadUrl, onProgress);
    onProgress(100);
    return { publicUrl, key };
  }

  function reportUploadError(
    message: string,
    scrollTarget?: HTMLElement | null
  ) {
    setError(message);
    toast.error(message);
    scrollTarget?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function validateBeforePublish(): string | null {
    if (!title.trim()) {
      return "Add a title before publishing";
    }
    if (!useExternalUrl && !videoFile) {
      return "Select a video file to upload";
    }
    if (useExternalUrl && !videoUrl.trim()) {
      return "Video URL is required";
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateBeforePublish();
    if (validationError) {
      reportUploadError(
        validationError,
        !useExternalUrl && !videoFile ? videoSectionRef.current : null
      );
      return;
    }

    setLoading(true);
    setUploadStep("preparing");
    setFileUploadPercent(null);

    try {
      const videoId = createId();
      let finalVideoUrl = videoUrl;
      let s3Key: string | undefined;
      let willTranscode = false;

      if (!useExternalUrl) {
        setUploadStep("preparing");
        const thumbnailFile = await resolveThumbnailForUpload();

        let videoPercent = 0;
        let thumbPercent = 0;
        const updateCombinedProgress = () => {
          setFileUploadPercent(Math.round((videoPercent + thumbPercent) / 2));
          // Video is the long pole; avoid thumbnail's setUploadStep winning the race.
          if (videoPercent < 100) {
            setUploadStep("uploading-video");
          } else if (thumbPercent < 100) {
            setUploadStep("uploading-thumbnail");
          }
        };

        setUploadStep("uploading-video");
        setFileUploadPercent(0);

        const [videoResult, thumbnailResult] = await Promise.all([
          uploadToStorage(
            videoFile!,
            "video",
            videoId,
            "uploading-video",
            (p) => {
              videoPercent = p;
              updateCombinedProgress();
            },
            { syncStep: false }
          ),
          uploadToStorage(
            thumbnailFile,
            "thumbnail",
            videoId,
            "uploading-thumbnail",
            (p) => {
              thumbPercent = p;
              updateCombinedProgress();
            },
            { syncStep: false }
          ),
        ]);

        finalVideoUrl = videoResult.publicUrl;
        s3Key = videoResult.key;
        willTranscode = true;

        setUploadStep("saving");
        setFileUploadPercent(null);

        const res = await fetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: videoId,
            title,
            description,
            visibility,
            videoUrl: finalVideoUrl,
            thumbnailUrl: thumbnailResult.publicUrl,
            s3Key,
            tags,
            useExternalUrl: false,
            ...(videoDuration != null && { duration: videoDuration }),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");

        if (willTranscode && data.status === "PROCESSING") {
          setUploadStep("transcoding");
          await waitForVideoReady(data.id);
        }

        localStorage.removeItem(DRAFT_KEY);
        router.push(`/watch/${data.id}`);
        router.refresh();
        return;
      }

      setUploadStep("preparing");
      setFileUploadPercent(null);
      const thumbnailFile = await resolveThumbnailForUpload();
      const finalThumbnailUrl = (
        await uploadToStorage(
          thumbnailFile,
          "thumbnail",
          videoId,
          "uploading-thumbnail",
          setFileUploadPercent
        )
      ).publicUrl;

      setUploadStep("saving");
      setFileUploadPercent(null);

      const externalDuration = await probeVideoDuration(finalVideoUrl.trim());

      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: videoId,
          title,
          description,
          visibility,
          videoUrl: finalVideoUrl,
          thumbnailUrl: finalThumbnailUrl,
          tags,
          useExternalUrl: true,
          ...(externalDuration != null && { duration: externalDuration }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      localStorage.removeItem(DRAFT_KEY);
      router.push(`/watch/${data.id}`);
      router.refresh();
    } catch (err) {
      reportUploadError(
        err instanceof Error ? err.message : "Upload failed"
      );
    } finally {
      setLoading(false);
      setUploadStep(null);
      setFileUploadPercent(null);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8"
      aria-busy={loading}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-[32px] md:leading-10">
            Upload video
          </h1>
          <p className="text-sm text-muted-foreground">
            Ready to share your creativity with the world? Fill in the details
            below.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-6"
            onClick={saveDraft}
            disabled={loading}
          >
            Save draft
          </Button>
          <Button
            type="submit"
            className="rounded-full px-6 shadow-md"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner data-icon="inline-start" />
                Publishing…
              </>
            ) : (
              "Publish video"
            )}
          </Button>
        </div>
      </header>

      {loading && uploadStep && (
        <UploadProgressPanel
          step={uploadStep}
          skipsVideoUpload={useExternalUrl}
          includesTranscode={!useExternalUrl}
          filePercent={fileUploadPercent}
          videoFileName={videoFile?.name}
        />
      )}

      <div
        className={cn(
          "grid grid-cols-1 gap-6 transition-opacity duration-300 motion-reduce:transition-none lg:grid-cols-12 lg:gap-6",
          loading && "pointer-events-none opacity-60"
        )}
      >
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-0">
              <CardTitle className="text-lg font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="upload-title">
                    Title (required)
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="upload-title"
                      value={title}
                      onChange={(e) =>
                        setTitle(e.target.value.slice(0, TITLE_MAX))
                      }
                      placeholder="Add a title that describes your video"
                      required
                      className="h-11 pr-16 text-base"
                      aria-invalid={!!error && !title.trim()}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
                      {title.length}/{TITLE_MAX}
                    </span>
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="upload-description">
                    Description
                  </FieldLabel>
                  <div className="relative">
                    <Textarea
                      id="upload-description"
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value.slice(0, DESC_MAX))
                      }
                      placeholder="Tell viewers about your video"
                      rows={6}
                      className="min-h-[140px] resize-none pb-8 text-base"
                    />
                    <span className="pointer-events-none absolute right-4 bottom-3 text-sm text-muted-foreground">
                      {description.length}/{DESC_MAX}
                    </span>
                  </div>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Visibility &amp; Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <Field>
                <FieldLabel htmlFor="upload-visibility">
                  Who can see this video?
                </FieldLabel>
                <VisibilitySelect
                  id="upload-visibility"
                  value={visibility}
                  onValueChange={setVisibility}
                  disabled={loading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="upload-tags">Tags</FieldLabel>
                <TagsInput
                  id="upload-tags"
                  value={tags}
                  onChange={setTags}
                  placeholder="tutorial, nextjs, design"
                />
                <FieldDescription>
                  Press Enter or comma to add a tag. Paste comma-separated
                  lists to add several at once.
                </FieldDescription>
              </Field>

              <Separator />

              <Field orientation="horizontal">
                <Switch
                  id="external-url"
                  checked={useExternalUrl}
                  onCheckedChange={setUseExternalUrl}
                />
                <FieldLabel
                  htmlFor="external-url"
                  className="cursor-pointer font-normal"
                >
                  Use external video URL instead of S3 upload
                </FieldLabel>
              </Field>

              {useExternalUrl && (
                <Field>
                  <FieldLabel htmlFor="upload-video-url">Video URL</FieldLabel>
                  <Input
                    id="upload-video-url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://... or .m3u8 for HLS"
                    required
                    className="h-11 text-base"
                  />
                  <FieldDescription>
                    Paste a direct video URL or HLS stream address.
                  </FieldDescription>
                </Field>
              )}
            </CardContent>
          </Card>

          <Alert className="border-primary/20 bg-primary/5">
            <InfoIcon className="text-primary" />
            <AlertTitle className="text-primary">Pro tip</AlertTitle>
            <AlertDescription className="text-primary/80">
              Adding descriptive tags and a rich description helps viewers
              discover your content.
            </AlertDescription>
          </Alert>
        </div>

        <div ref={videoSectionRef} className="flex flex-col gap-6 lg:col-span-5">
          <Card
            className={cn(
              "gap-0 overflow-hidden border-border bg-card p-0 py-0 shadow-sm",
              error === "Select a video file to upload" &&
                !useExternalUrl &&
                !videoFile &&
                "ring-2 ring-destructive"
            )}
          >
            <div
              className={cn(
                "group/preview relative aspect-video w-full overflow-hidden rounded-t-xl bg-surface-dark",
                !useExternalUrl && "cursor-pointer"
              )}
              onClick={() => {
                if (videoPreviewUrl) {
                  togglePreviewPlayback();
                } else if (!useExternalUrl) {
                  fileInputRef.current?.click();
                }
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                if (videoPreviewUrl) {
                  togglePreviewPlayback();
                } else if (!useExternalUrl) {
                  fileInputRef.current?.click();
                }
              }}
              role={!useExternalUrl ? "button" : undefined}
              tabIndex={!useExternalUrl ? 0 : undefined}
              aria-label={
                !useExternalUrl
                  ? videoPreviewUrl
                    ? isPreviewPlaying
                      ? "Pause video preview"
                      : "Play video preview"
                    : "Choose video file to upload"
                  : undefined
              }
            >
              {videoPreviewUrl ? (
                <video
                  ref={videoPreviewRef}
                  src={videoPreviewUrl}
                  className="absolute inset-0 size-full object-cover opacity-90"
                  playsInline
                  preload="metadata"
                  onPlay={() => setIsPreviewPlaying(true)}
                  onPause={() => setIsPreviewPlaying(false)}
                  onEnded={() => setIsPreviewPlaying(false)}
                />
              ) : (
                <div
                  className="absolute inset-0 bg-linear-to-br from-(--color-gradient-sky-light) to-(--color-gradient-sky-mid)"
                  aria-hidden
                />
              )}
              {(!videoPreviewUrl || !isPreviewPlaying) && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex size-16 items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur-md transition-transform group-hover/preview:scale-105">
                    <CirclePlayIcon className="text-white" />
                  </div>
                </div>
              )}
            </div>

            <CardContent className="flex flex-col gap-6 p-6">
              {!useExternalUrl ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_VIDEO_TYPES.join(",")}
                    className="sr-only"
                    onChange={(e) =>
                      void handleVideoFileChange(e.target.files?.[0] ?? null)
                    }
                  />
                  {videoFile ? (
                    <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/40 p-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <VideoIcon className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">
                            {videoFile.name}
                          </p>
                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-primary/10 text-primary"
                          >
                            Ready
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(videoFile.size)} •{" "}
                          {fileExtension(videoFile.name)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="relative w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30">
                      <button
                        type="button"
                        className="flex w-full flex-col items-center justify-center gap-2 px-4 py-8 transition-colors hover:bg-muted/50"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                      >
                        <VideoIcon className="text-muted-foreground" />
                        <span className="text-sm font-semibold">
                          Choose video file
                        </span>
                        <span className="text-center text-xs text-muted-foreground">
                          MP4, WebM, MOV, MKV — max 1 GB
                        </span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Video will be loaded from the external URL you provided.
                </p>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Thumbnail</h3>
                  {customThumbnailFile && videoFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs"
                      onClick={() => void restoreVideoFrameThumbnail()}
                      disabled={generatingThumbnail || loading}
                    >
                      Use video frame
                    </Button>
                  )}
                </div>

                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES}
                  className="sr-only"
                  onChange={(e) => {
                    handleCustomThumbnailChange(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />

                <div
                  className={cn(
                    "relative aspect-video overflow-hidden rounded-xl",
                    thumbnailPreviewUrl
                      ? "border-0"
                      : "border-2 border-dashed border-border bg-muted/30"
                  )}
                >
                  {generatingThumbnail ? (
                    <div className="flex size-full flex-col items-center justify-center gap-2">
                      <Spinner />
                      <span className="text-xs text-muted-foreground">
                        Capturing frame from video…
                      </span>
                    </div>
                  ) : thumbnailPreviewUrl ? (
                    <>
                      <img
                        src={thumbnailPreviewUrl}
                        alt="Video thumbnail preview"
                        className="size-full object-cover"
                      />
                      <div className="absolute right-2 bottom-2 flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => thumbnailInputRef.current?.click()}
                          disabled={loading}
                        >
                          Change
                        </Button>
                        {customThumbnailFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void restoreVideoFrameThumbnail()}
                            disabled={loading || !videoFile}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      {!customThumbnailFile && videoFile && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 bg-background/90 text-xs"
                        >
                          From video
                        </Badge>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      className="flex size-full flex-col items-center justify-center gap-2 p-4 transition-colors hover:bg-muted/50"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={loading}
                    >
                      <ImagePlusIcon className="text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        Upload thumbnail
                      </span>
                      <span className="text-center text-xs text-muted-foreground">
                        {videoFile
                          ? "Or wait — a frame is captured when you pick a video"
                          : "16:9 image, max 10 MB"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Upload failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
