/**
 * Capture a JPEG frame from a video file or URL (browser only).
 * Picks a random timestamp between 5% and 95% of duration to avoid black frames.
 */
export async function captureVideoThumbnail(
  source: File | string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    let objectUrl: string | null = null;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        video.currentTime = 0;
        return;
      }
      const min = Math.min(duration * 0.05, 1);
      const max = Math.max(duration * 0.95, min + 0.1);
      video.currentTime = min + Math.random() * (max - min);
    };

    video.onseeked = () => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) {
        cleanup();
        reject(new Error("Could not read video dimensions"));
        return;
      }

      const canvas = document.createElement("canvas");
      const maxW = 1280;
      const scale = w > maxW ? maxW / w : 1;
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        cleanup();
        reject(new Error("Canvas not supported"));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          cleanup();
          if (blob) resolve(blob);
          else reject(new Error("Failed to encode thumbnail"));
        },
        "image/jpeg",
        0.85
      );
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video for thumbnail"));
    };

    if (source instanceof File) {
      objectUrl = URL.createObjectURL(source);
      video.src = objectUrl;
    } else {
      video.crossOrigin = "anonymous";
      video.src = source;
    }
  });
}
