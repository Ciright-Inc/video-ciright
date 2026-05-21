"use client";

import { CheckIcon, UploadIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type UploadStep =
  | "preparing"
  | "uploading-video"
  | "uploading-thumbnail"
  | "saving"
  | "transcoding";

type StepConfig = {
  id: UploadStep;
  label: string;
  description: string;
};

const ALL_STEPS: StepConfig[] = [
  {
    id: "preparing",
    label: "Prepare",
    description: "Getting your video and thumbnail ready",
  },
  {
    id: "uploading-video",
    label: "Video",
    description: "Sending your video file to storage",
  },
  {
    id: "uploading-thumbnail",
    label: "Thumbnail",
    description: "Sending cover image to storage",
  },
  {
    id: "saving",
    label: "Publish",
    description: "Saving your video to the library",
  },
  {
    id: "transcoding",
    label: "Process",
    description: "Converting to adaptive streaming (HLS)",
  },
];

function stepsForUpload(skipsVideo: boolean, includesTranscode: boolean): StepConfig[] {
  let steps = ALL_STEPS;
  if (skipsVideo) {
    steps = steps.filter((s) => s.id !== "uploading-video");
  }
  if (!includesTranscode) {
    steps = steps.filter((s) => s.id !== "transcoding");
  }
  return steps;
}

function stepIndex(steps: StepConfig[], step: UploadStep): number {
  return steps.findIndex((s) => s.id === step);
}

function uploadSliceSpan(steps: StepConfig[]): number {
  const hasVideo = steps.some((s) => s.id === "uploading-video");
  const hasThumb = steps.some((s) => s.id === "uploading-thumbnail");
  const slice = 100 / steps.length;
  if (hasVideo && hasThumb) return slice * 2;
  if (hasVideo || hasThumb) return slice;
  return 0;
}

function overallPercent(
  steps: StepConfig[],
  step: UploadStep,
  filePercent: number | null,
): number {
  const index = stepIndex(steps, step);
  if (index < 0) return 0;

  const slice = 100 / steps.length;
  const base = index * slice;
  const uploadSpan = uploadSliceSpan(steps);
  const uploadBase =
    stepIndex(steps, "uploading-video") >= 0
      ? stepIndex(steps, "uploading-video") * slice
      : stepIndex(steps, "uploading-thumbnail") * slice;

  if (
    filePercent !== null &&
    uploadSpan > 0 &&
    (step === "uploading-video" || step === "uploading-thumbnail")
  ) {
    return uploadBase + (filePercent / 100) * uploadSpan;
  }

  return base + slice * 0.35;
}

function progressTitle(step: UploadStep, current?: StepConfig): string {
  if (step === "transcoding") return "Processing your video";
  if (current?.label === "Prepare") return "Preparing upload";
  if (current?.label === "Publish") return "Publishing";
  return `Uploading ${current?.label.toLowerCase()}`;
}

type UploadProgressPanelProps = {
  step: UploadStep;
  skipsVideoUpload: boolean;
  includesTranscode?: boolean;
  filePercent: number | null;
  videoFileName?: string | null;
  /** Finished steps (e.g. thumbnail done while video still uploading in parallel) */
  completedSteps?: UploadStep[];
};

export function UploadProgressPanel({
  step,
  skipsVideoUpload,
  includesTranscode = false,
  filePercent,
  videoFileName,
  completedSteps = [],
}: UploadProgressPanelProps) {
  const steps = stepsForUpload(skipsVideoUpload, includesTranscode);
  const current = steps.find((s) => s.id === step);
  const activeIndex = stepIndex(steps, step);
  const completedSet = new Set(completedSteps);
  const percent = Math.min(
    100,
    Math.round(overallPercent(steps, step, filePercent)),
  );

  const showFilePercent =
    filePercent !== null &&
    (step === "uploading-video" || step === "uploading-thumbnail");

  return (
    <Card
      className="overflow-hidden border-primary/20 bg-card shadow-sm ring-1 ring-primary/15"
      role="region"
      aria-live="polite"
      aria-labelledby="upload-progress-title"
      aria-describedby="upload-progress-desc"
    >
      <CardHeader className="border-b border-border/80 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {step === "saving" ? <Spinner /> : <UploadIcon />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <CardTitle
                id="upload-progress-title"
                className="text-lg font-semibold tracking-tight"
              >
                {progressTitle(step, current)}
              </CardTitle>
              <CardDescription
                id="upload-progress-desc"
                className="text-sm leading-relaxed"
              >
                {step === "transcoding"
                  ? "We're converting your upload to adaptive streaming. This page will refresh automatically when it's ready."
                  : current?.description}
                {step === "uploading-video" && videoFileName ? (
                  <span className="mt-1 block truncate font-medium text-foreground">
                    {videoFileName}
                  </span>
                ) : null}
              </CardDescription>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-0.5 sm:min-w-28">
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-primary">
              {percent}%
            </span>
            {showFilePercent ? (
              <span className="text-xs font-medium text-muted-foreground">
                File transfer {filePercent}%
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Overall</span>
            )}
          </div>
        </div>
        <div
          className="h-1 w-full bg-muted mt-2 rounded-full"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall upload progress"
        >
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-4">
        <ol
          className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-1"
          aria-label="Upload steps"
        >
          {steps.map((s, i) => {
            const done = completedSet.has(s.id) || i < activeIndex;
            const active = s.id === step && !done;

            return (
              <li
                key={s.id}
                className={cn(
                  "flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-200 motion-reduce:transition-none sm:min-h-0 sm:border-transparent sm:bg-transparent sm:px-2 sm:py-1",
                  active &&
                    "border-primary/25 bg-primary/5 sm:border-transparent",
                  done &&
                    "border-transparent bg-muted/40 text-muted-foreground",
                  !done &&
                    !active &&
                    "border-border/60 bg-muted/20 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border",
                    done && "border-primary/30 bg-primary/10 text-primary",
                    active &&
                      "border-primary bg-primary text-primary-foreground",
                    !done &&
                      !active &&
                      "border-border bg-background text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {done ? (
                    <CheckIcon className="size-3.5" strokeWidth={2.5} />
                  ) : active ? (
                    <Spinner className="text-primary-foreground" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current opacity-40" />
                  )}
                </span>
                <span
                  className={cn(
                    "font-medium",
                    active && "text-foreground",
                    done && "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {step === "transcoding"
            ? "Keep this tab open. Large videos may take a few minutes to become playable."
            : "Keep this tab open until publishing finishes. Large videos may take a few minutes."}
        </p>
      </CardContent>
    </Card>
  );
}
