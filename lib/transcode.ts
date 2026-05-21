import { after } from "next/server";
import { runTranscodeJob } from "@/lib/transcode-job";

function getTranscodeSecret(): string | null {
  return process.env.TRANSCODE_SECRET ?? null;
}

function hasAwsForTranscode(): boolean {
  const region = process.env.AWS_REGION;
  const accessKey =
    process.env.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY;
  const secretKey =
    process.env.AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_KEY;
  return Boolean(region && accessKey && secretKey);
}

export function isTranscodingEnabled(): boolean {
  return hasAwsForTranscode() && Boolean(getTranscodeSecret());
}

export type TriggerTranscodeOptions = {
  videoId: string;
  channelId: string;
  s3Key: string;
};

/**
 * Schedules HLS transcoding (240p / 720p / 1080p) after the HTTP response is sent.
 * Must be called from a Route Handler or Server Action in the same request.
 */
export function triggerTranscode(
  options: TriggerTranscodeOptions
): { ok: boolean; error?: string } {
  if (!getTranscodeSecret()) {
    return { ok: false, error: "TRANSCODE_SECRET is not configured" };
  }

  if (!hasAwsForTranscode()) {
    return { ok: false, error: "AWS credentials are not configured" };
  }

  after(async () => {
    try {
      await runTranscodeJob(options);
    } catch (err) {
      console.error(`Transcode failed for ${options.videoId}:`, err);
    }
  });

  return { ok: true };
}
