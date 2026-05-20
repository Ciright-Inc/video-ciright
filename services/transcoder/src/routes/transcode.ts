import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Router } from "express";
import type { TranscodeRequest } from "../types.js";
import { notifyCallback } from "../lib/callback.js";
import { transcodeToHls } from "../lib/ffmpeg.js";
import {
  buildHlsPrefix,
  downloadObjectToFile,
  getPublicObjectUrl,
  uploadDirectoryToS3,
} from "../lib/s3.js";

export const transcodeRouter = Router();

function getTranscodeSecret(): string {
  const secret = process.env.TRANSCODE_SECRET;
  if (!secret) {
    throw new Error("TRANSCODE_SECRET is not configured");
  }
  return secret;
}

async function processTranscodeJob(job: TranscodeRequest): Promise<void> {
  const workDir = await mkdtemp(path.join(os.tmpdir(), "transcode-"));
  const inputPath = path.join(workDir, "original" + path.extname(job.s3Key));

  try {
    await downloadObjectToFile(job.s3Key, inputPath);

    const { outputDir, durationSeconds } = await transcodeToHls(inputPath);

    const hlsPrefix = buildHlsPrefix(job.channelId, job.videoId);
    await uploadDirectoryToS3(outputDir, hlsPrefix);

    const masterKey = `${hlsPrefix}master.m3u8`;
    const videoUrl = getPublicObjectUrl(masterKey);

    await notifyCallback(job.callbackUrl, {
      secret: job.secret,
      status: "ready",
      videoUrl,
      duration: durationSeconds ?? undefined,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Transcoding failed";

    try {
      await notifyCallback(job.callbackUrl, {
        secret: job.secret,
        status: "failed",
        error: message,
      });
    } catch (callbackErr) {
      console.error("Failed to send error callback:", callbackErr);
    }
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

transcodeRouter.post("/transcode", (req, res) => {
  const expectedSecret = getTranscodeSecret();
  const body = req.body as Partial<TranscodeRequest>;

  if (body.secret !== expectedSecret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { videoId, channelId, s3Key, callbackUrl, secret } = body;

  if (!videoId || !channelId || !s3Key || !callbackUrl || !secret) {
    res.status(400).json({
      error: "videoId, channelId, s3Key, callbackUrl, and secret are required",
    });
    return;
  }

  const job: TranscodeRequest = {
    videoId,
    channelId,
    s3Key,
    callbackUrl,
    secret,
  };

  res.status(202).json({ accepted: true, videoId });

  void processTranscodeJob(job).catch((err) => {
    console.error(`Transcode job failed for ${videoId}:`, err);
  });
});

transcodeRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});
