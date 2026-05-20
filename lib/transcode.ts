function getTranscoderUrl(): string | null {
  return process.env.TRANSCODER_URL?.replace(/\/$/, "") ?? null;
}

function getTranscodeSecret(): string | null {
  return process.env.TRANSCODE_SECRET ?? null;
}

export function isTranscodingEnabled(): boolean {
  return Boolean(getTranscoderUrl() && getTranscodeSecret());
}

export type TriggerTranscodeOptions = {
  videoId: string;
  channelId: string;
  s3Key: string;
  callbackUrl: string;
};

export async function triggerTranscode(
  options: TriggerTranscodeOptions
): Promise<{ ok: boolean; error?: string }> {
  const baseUrl = getTranscoderUrl();
  const secret = getTranscodeSecret();

  if (!baseUrl || !secret) {
    return { ok: false, error: "Transcoder is not configured" };
  }

  try {
    const response = await fetch(`${baseUrl}/transcode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...options,
        secret,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      return {
        ok: false,
        error: data.error ?? `Transcoder returned ${response.status}`,
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to reach transcoder",
    };
  }
}

export function buildTranscodeCallbackUrl(videoId: string): string {
  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null;
  const base =
    authUrl?.replace(/\/$/, "") ??
    vercelUrl ??
    "http://localhost:3000";

  return `${base}/api/videos/${videoId}/transcode-complete`;
}
