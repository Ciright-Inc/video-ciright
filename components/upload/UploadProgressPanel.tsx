"use client";

import {
  CheckIcon,
  FileImageIcon,
  FileVideoIcon,
  SettingsIcon,
  UploadIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const UPLOAD_STEP_IDS: UploadStep[] = [
  "uploading-video",
  "uploading-thumbnail",
];

function overallPercent(
  steps: StepConfig[],
  filePercent: number | null,
  completedSteps: ReadonlySet<UploadStep>,
  activeSteps: ReadonlySet<UploadStep>,
): number {
  if (steps.length > 0 && steps.every((s) => completedSteps.has(s.id))) {
    return 100;
  }

  const slice = 100 / steps.length;
  let percent = steps
    .filter((s) => completedSteps.has(s.id))
    .reduce((sum) => sum + slice, 0);

  const uploadStepsInFlow = steps.filter((s) =>
    UPLOAD_STEP_IDS.includes(s.id),
  );
  const isUploadingFiles = uploadStepsInFlow.some((s) =>
    activeSteps.has(s.id),
  );

  if (filePercent !== null && isUploadingFiles) {
    const uploadSliceTotal = uploadStepsInFlow.length * slice;
    const uploadDoneSlices =
      uploadStepsInFlow.filter((s) => completedSteps.has(s.id)).length * slice;
    const remainingUploadSlice = uploadSliceTotal - uploadDoneSlices;
    percent += (filePercent / 100) * remainingUploadSlice;
  } else {
    for (const s of steps) {
      if (
        activeSteps.has(s.id) &&
        !completedSteps.has(s.id) &&
        !UPLOAD_STEP_IDS.includes(s.id)
      ) {
        percent += slice * 0.5;
      }
    }
  }

  return Math.min(100, percent);
}

function progressTitle(
  step: UploadStep,
  activeSteps: ReadonlySet<UploadStep>,
  current?: StepConfig,
): string {
  if (step === "transcoding") return "Processing your video";
  if (
    activeSteps.has("uploading-video") &&
    activeSteps.has("uploading-thumbnail")
  ) {
    return "Uploading video and thumbnail";
  }
  if (current?.label === "Prepare") return "Preparing upload";
  if (current?.label === "Publish") return "Publishing";
  if (current?.label === "Video") return "Uploading video";
  if (current?.label === "Thumbnail") return "Uploading thumbnail";
  return `Uploading ${current?.label.toLowerCase() ?? "files"}`;
}

const HEADER_ICON_SPIN_STYLE = { animationDuration: "1.35s" } as const;
const PROGRESS_TRANSITION = {
  duration: 0.45,
  ease: [0.23, 1, 0.32, 1],
} as const;

function HeaderIcon({ step }: { step: UploadStep }) {
  let Icon = UploadIcon;
  if (step === "uploading-video") Icon = FileVideoIcon;
  else if (step === "uploading-thumbnail") Icon = FileImageIcon;
  else if (step === "saving" || step === "transcoding") Icon = SettingsIcon;

  return (
    <span
      className="relative flex size-12 shrink-0 items-center justify-center"
      aria-hidden
    >
      <svg
        className="absolute inset-0 size-full text-primary/20"
        viewBox="0 0 48 48"
        fill="none"
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      </svg>

      <svg
        className="absolute inset-0 size-full -rotate-90 text-primary motion-safe:animate-spin"
        viewBox="0 0 48 48"
        fill="none"
        style={HEADER_ICON_SPIN_STYLE}
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="34 92"
          className="motion-reduce:opacity-70"
        />
      </svg>

      <span className="relative flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-primary/25 via-primary/12 to-primary/5 ring-1 ring-inset ring-primary/20">
        <Icon className="size-[22px] text-primary" strokeWidth={2} />
      </span>
    </span>
  );
}

function StepSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "size-3.5 shrink-0 motion-safe:animate-spin motion-reduce:animate-none",
        className,
      )}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        className="opacity-25"
      />
      <path
        d="M8 2a6 6 0 0 1 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StepStatusIcon({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <motion.span
        key="done"
        initial={{ opacity: 0, scale: 0.72 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.72 }}
        transition={{ type: "spring", stiffness: 500, damping: 24 }}
      >
        <CheckIcon className="size-3.5" strokeWidth={2.5} />
      </motion.span>
    );
  }

  if (active) {
    return (
      <motion.span
        key="active"
        className="flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <StepSpinner className="text-primary-foreground" />
      </motion.span>
    );
  }

  return (
    <motion.span
      key="pending"
      className="size-2 rounded-full bg-current opacity-55"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 0.55, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    />
  );
}

function AnimatedStepStatus({
  done,
  active,
}: {
  done: boolean;
  active: boolean;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <StepStatusIcon
        key={done ? "done" : active ? "active" : "pending"}
        done={done}
        active={active}
      />
    </AnimatePresence>
  );
}

type UploadProgressPanelProps = {
  step: UploadStep;
  skipsVideoUpload: boolean;
  includesTranscode?: boolean;
  filePercent: number | null;
  videoFileName?: string | null;
  /** Finished steps (e.g. thumbnail done while video still uploading in parallel) */
  completedSteps?: UploadStep[];
  /** Steps currently in progress (supports parallel video + thumbnail upload) */
  activeSteps?: UploadStep[];
};

export function UploadProgressPanel({
  step,
  skipsVideoUpload,
  includesTranscode = false,
  filePercent,
  videoFileName,
  completedSteps = [],
  activeSteps,
}: UploadProgressPanelProps) {
  const reduced = useReducedMotion();
  const steps = stepsForUpload(skipsVideoUpload, includesTranscode);
  const current = steps.find((s) => s.id === step);
  const completedSet = new Set(completedSteps);
  const activeSet = new Set(
    activeSteps?.length ? activeSteps : step ? [step] : [],
  );
  const isUploadingFiles = UPLOAD_STEP_IDS.some((id) => activeSet.has(id));
  const showFilePercent = filePercent !== null && isUploadingFiles;
  // Never show 100% while file steps are still active (bytes sent ≠ step done)
  const effectiveFilePercent =
    filePercent !== null && isUploadingFiles
      ? Math.min(filePercent, 99)
      : filePercent;
  const displayFilePercent = showFilePercent ? effectiveFilePercent : null;
  const percent = Math.min(
    100,
    Math.round(
      overallPercent(steps, effectiveFilePercent, completedSet, activeSet),
    ),
  );

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
            <HeaderIcon step={step} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <CardTitle
                id="upload-progress-title"
                className="text-lg font-semibold tracking-tight"
              >
                {progressTitle(step, activeSet, current)}
              </CardTitle>
              <CardDescription
                id="upload-progress-desc"
                className="text-sm leading-relaxed"
              >
                {step === "transcoding"
                  ? "We're converting your upload to adaptive streaming. You'll be redirected when it's ready."
                  : current?.description}
                {activeSet.has("uploading-video") && videoFileName ? (
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
            {displayFilePercent !== null ? (
              <span className="text-xs font-medium text-muted-foreground">
                File transfer {displayFilePercent}%
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Overall</span>
            )}
          </div>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall upload progress"
        >
          <motion.div
            className="h-full origin-left rounded-full bg-primary"
            initial={false}
            animate={{ scaleX: percent / 100 }}
            transition={reduced ? { duration: 0 } : PROGRESS_TRANSITION}
          />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-4">
        <ol
          className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5"
          aria-label="Upload steps"
        >
          {steps.map((s) => {
            const done = completedSet.has(s.id);
            const active = activeSet.has(s.id) && !done;

            return (
              <li
                key={s.id}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-200 motion-reduce:transition-none sm:min-h-0 sm:px-2.5 sm:py-1.5",
                  active &&
                    "border-primary/35 bg-primary/10 text-foreground shadow-sm shadow-primary/10",
                  done &&
                    "border-primary/15 bg-primary/5 text-foreground",
                  !done &&
                    !active &&
                    "border-border/70 bg-muted/20 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative flex size-6 shrink-0 items-center justify-center rounded-full border",
                    done &&
                      "border-primary bg-primary text-primary-foreground",
                    active &&
                      "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/40",
                    !done &&
                      !active &&
                      "border-border bg-background text-muted-foreground",
                  )}
                  aria-hidden
                >
                  <AnimatedStepStatus done={done} active={active} />
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
