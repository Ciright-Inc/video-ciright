import { createWriteStream } from "node:fs";
import { mkdtemp, readdir, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createReadStream } from "node:fs";
import { VideoStatus } from "@prisma/client";
import { transcodeToHls } from "@/lib/ffmpeg";
import { prisma } from "@/lib/prisma";
import {
  buildHlsMasterKey,
  buildHlsPrefix,
  downloadObjectToFile,
  getPublicObjectUrl,
  uploadDirectoryToS3,
} from "@/lib/s3";

export type TranscodeJobInput = {
  videoId: string;
  channelId: string;
  s3Key: string;
};

export async function runTranscodeJob(
  job: TranscodeJobInput
): Promise<void> {
  const workDir = await mkdtemp(path.join(os.tmpdir(), "transcode-"));
  const inputPath = path.join(workDir, "original" + path.extname(job.s3Key));

  try {
    await downloadObjectToFile(job.s3Key, inputPath);

    const { outputDir, durationSeconds } = await transcodeToHls(inputPath);

    const hlsPrefix = buildHlsPrefix(job.channelId, job.videoId);
    await uploadDirectoryToS3(outputDir, hlsPrefix);

    const videoUrl = getPublicObjectUrl(
      buildHlsMasterKey(job.channelId, job.videoId)
    );

    await prisma.video.update({
      where: { id: job.videoId },
      data: {
        videoUrl,
        status: VideoStatus.READY,
        ...(durationSeconds != null && { duration: durationSeconds }),
      },
    });
  } catch (err) {
    await prisma.video
      .update({
        where: { id: job.videoId },
        data: { status: VideoStatus.FAILED },
      })
      .catch(() => {});

    const message = err instanceof Error ? err.message : "Transcoding failed";
    console.error(`Transcode failed for video ${job.videoId}:`, message);
    throw err;
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
