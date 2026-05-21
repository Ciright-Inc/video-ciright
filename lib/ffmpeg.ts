import { createRequire } from "node:module";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import ffmpeg from "fluent-ffmpeg";

const require = createRequire(import.meta.url);
const ffmpegBin = require("ffmpeg-static") as string | undefined;
const ffprobeBin = (require("ffprobe-static") as { path: string }).path;

if (ffmpegBin) {
  ffmpeg.setFfmpegPath(ffmpegBin);
}
ffmpeg.setFfprobePath(ffprobeBin);

const HLS_SEGMENT_SECONDS = 6;

const VARIANTS = [
  { name: "1080p", height: 1080, videoBitrate: "5000k", audioBitrate: "192k" },
  { name: "720p", height: 720, videoBitrate: "2500k", audioBitrate: "128k" },
  { name: "240p", height: 240, videoBitrate: "400k", audioBitrate: "64k" },
] as const;

export type TranscodeResult = {
  outputDir: string;
  masterPlaylistPath: string;
  durationSeconds: number | null;
};

function runFfmpeg(command: ffmpeg.FfmpegCommand): Promise<void> {
  return new Promise((resolve, reject) => {
    command.on("end", () => resolve()).on("error", (err) => reject(err));
  });
}

function probeDuration(inputPath: string): Promise<number | null> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        resolve(null);
        return;
      }
      const duration = metadata.format.duration;
      resolve(
        typeof duration === "number" && Number.isFinite(duration)
          ? Math.round(duration)
          : null
      );
    });
  });
}

async function transcodeVariant(
  inputPath: string,
  outputDir: string,
  variant: (typeof VARIANTS)[number]
): Promise<string> {
  const playlistPath = path.join(outputDir, `${variant.name}.m3u8`);
  const segmentPattern = path.join(outputDir, `${variant.name}_%03d.ts`);

  const command = ffmpeg(inputPath)
    .outputOptions([
      "-vf",
      `scale=-2:${variant.height}`,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-profile:v",
      "main",
      "-crf",
      "23",
      "-b:v",
      variant.videoBitrate,
      "-maxrate",
      variant.videoBitrate,
      "-bufsize",
      "2M",
      "-c:a",
      "aac",
      "-b:a",
      variant.audioBitrate,
      "-ac",
      "2",
      "-ar",
      "48000",
      "-f",
      "hls",
      "-hls_time",
      String(HLS_SEGMENT_SECONDS),
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      segmentPattern,
      "-hls_flags",
      "independent_segments",
    ])
    .output(playlistPath);

  await runFfmpeg(command);
  return playlistPath;
}

async function writeMasterPlaylist(
  outputDir: string,
  variantPlaylists: { name: string; playlistPath: string }[]
): Promise<string> {
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3"];

  const bandwidthMap: Record<string, number> = {
    "1080p": 5_500_000,
    "720p": 2_500_000,
    "240p": 450_000,
  };

  const resolutionMap: Record<string, string> = {
    "1080p": "1920x1080",
    "720p": "1280x720",
    "240p": "426x240",
  };

  for (const variant of variantPlaylists) {
    const bandwidth = bandwidthMap[variant.name] ?? 800_000;
    const resolution = resolutionMap[variant.name] ?? "640x360";
    lines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}`,
      path.basename(variant.playlistPath)
    );
  }

  const masterPath = path.join(outputDir, "master.m3u8");
  await writeFile(masterPath, `${lines.join("\n")}\n`, "utf8");
  return masterPath;
}

export async function transcodeToHls(inputPath: string): Promise<TranscodeResult> {
  const outputDir = path.join(
    path.dirname(inputPath),
    `hls-${path.basename(inputPath, path.extname(inputPath))}`
  );

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const durationSeconds = await probeDuration(inputPath);

  const variantPlaylists: { name: string; playlistPath: string }[] = [];
  for (const variant of VARIANTS) {
    const playlistPath = await transcodeVariant(inputPath, outputDir, variant);
    variantPlaylists.push({ name: variant.name, playlistPath });
  }

  const masterPlaylistPath = await writeMasterPlaylist(
    outputDir,
    variantPlaylists
  );

  return { outputDir, masterPlaylistPath, durationSeconds };
}
