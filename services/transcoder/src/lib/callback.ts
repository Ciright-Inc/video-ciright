import type { TranscodeCallbackPayload } from "../types.js";

export async function notifyCallback(
  callbackUrl: string,
  payload: TranscodeCallbackPayload
): Promise<void> {
  const response = await fetch(callbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Callback failed (${response.status}): ${text || response.statusText}`
    );
  }
}
