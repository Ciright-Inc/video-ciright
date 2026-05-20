/**
 * Read duration in seconds from a video file or URL (browser only).
 */
export async function probeVideoDuration(
  source: File | string
): Promise<number | null> {
  return new Promise((resolve) => {
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
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) {
        resolve(null);
        return;
      }
      resolve(Math.round(duration));
    };

    video.onerror = () => {
      cleanup();
      resolve(null);
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
