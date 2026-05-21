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
  { name: "420p", height: 420, videoBitrate: "800k", audioBitrate: "96k" },
  { name: "240p", height: 240, videoBitrate: "400k", audioBitrate: "64k" },
] as const;

type Variant = {
  name: string;
  height: number;
  videoBitrate: string;
  audioBitrate: string;
};

type SourceMetadata = {
  durationSeconds: number | null;
  width: number;
  height: number;
};

export type TranscodeResult = {
  outputDir: string;
  masterPlaylistPath: string;
  durationSeconds: number | null;
};

function runFfmpeg(command: ffmpeg.FfmpegCommand): Promise<void> {
  return new Promise((resolve, reject) => {
    command.on("end", () => resolve()).on("error", (err) => reject(err)).run();
  });
}

function probeSourceMetadata(inputPath: string): Promise<SourceMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );
      const width = videoStream?.width;
      const height = videoStream?.height;

      if (
        typeof width !== "number" ||
        typeof height !== "number" ||
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width <= 0 ||
        height <= 0
      ) {
        reject(new Error("Could not determine video resolution"));
        return;
      }

      const duration = metadata.format.duration;
      resolve(
        {
          durationSeconds:
            typeof duration === "number" && Number.isFinite(duration)
              ? Math.round(duration)
              : null,
          width,
          height,
        }
      );
    });
  });
}

function chooseVariants(sourceHeight: number): Variant[] {
  const variants = VARIANTS.filter((variant) => variant.height <= sourceHeight);
  if (variants.length > 0) return variants;

  const fallbackHeight = Math.max(2, sourceHeight - (sourceHeight % 2));
  return [
    {
      ...VARIANTS[VARIANTS.length - 1],
      name: `${fallbackHeight}p`,
      height: fallbackHeight,
    },
  ];
}

function outputWidthForHeight(
  sourceWidth: number,
  sourceHeight: number,
  targetHeight: number
) {
  const scaledWidth = Math.round((sourceWidth * targetHeight) / sourceHeight);
  return scaledWidth % 2 === 0 ? scaledWidth : scaledWidth + 1;
}

async function transcodeVariant(
  inputPath: string,
  outputDir: string,
  variant: Variant
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
  variantPlaylists: {
    name: string;
    height: number;
    width: number;
    playlistPath: string;
  }[]
): Promise<string> {
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3"];

  const bandwidthMap: Record<string, number> = {
    "1080p": 5_500_000,
    "720p": 2_500_000,
    "420p": 900_000,
    "240p": 450_000,
  };

  for (const variant of variantPlaylists) {
    const bandwidth = bandwidthMap[variant.name] ?? 800_000;
    lines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${variant.width}x${variant.height}`,
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

  const source = await probeSourceMetadata(inputPath);
  const variants = chooseVariants(source.height);

  const variantPlaylists: {
    name: string;
    height: number;
    width: number;
    playlistPath: string;
  }[] = [];
  for (const variant of variants) {
    const playlistPath = await transcodeVariant(inputPath, outputDir, variant);
    variantPlaylists.push({
      name: variant.name,
      height: variant.height,
      width: outputWidthForHeight(source.width, source.height, variant.height),
      playlistPath,
    });
  }

  const masterPlaylistPath = await writeMasterPlaylist(
    outputDir,
    variantPlaylists
  );

  return {
    outputDir,
    masterPlaylistPath,
    durationSeconds: source.durationSeconds,
  };
}
