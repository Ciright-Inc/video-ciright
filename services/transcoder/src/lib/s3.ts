import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: requireEnv("AWS_REGION"),
      credentials: {
        accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
      },
    });
  }
  return s3Client;
}

export function getS3Bucket(): string {
  return process.env.AWS_S3_BUCKET ?? "video-ciright";
}

export function getPublicObjectUrl(key: string): string {
  const base = process.env.AWS_S3_PUBLIC_URL_BASE?.replace(/\/$/, "");
  if (base) return `${base}/${key}`;

  const bucket = getS3Bucket();
  const region = requireEnv("AWS_REGION");
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function buildHlsPrefix(channelId: string, videoId: string): string {
  return `videos/${channelId}/${videoId}/hls/`;
}

export async function downloadObjectToFile(
  key: string,
  destPath: string
): Promise<void> {
  const response = await getS3Client().send(
    new GetObjectCommand({
      Bucket: getS3Bucket(),
      Key: key,
    })
  );

  if (!response.Body) {
    throw new Error(`S3 object not found: ${key}`);
  }

  await pipeline(
    response.Body as NodeJS.ReadableStream,
    createWriteStream(destPath)
  );
}

function contentTypeForFile(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".m3u8":
      return "application/vnd.apple.mpegurl";
    case ".ts":
      return "video/mp2t";
    default:
      return "application/octet-stream";
  }
}

export async function uploadDirectoryToS3(
  localDir: string,
  s3Prefix: string
): Promise<void> {
  const entries = await readdir(localDir, { withFileTypes: true });

  for (const entry of entries) {
    const localPath = path.join(localDir, entry.name);
    if (entry.isDirectory()) {
      await uploadDirectoryToS3(
        localPath,
        `${s3Prefix}${entry.name}/`
      );
      continue;
    }

    const key = `${s3Prefix}${entry.name}`;
    const fileStat = await stat(localPath);

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: getS3Bucket(),
        Key: key,
        Body: createReadStream(localPath),
        ContentLength: fileStat.size,
        ContentType: contentTypeForFile(localPath),
        CacheControl: entry.name.endsWith(".m3u8")
          ? "public, max-age=60"
          : "public, max-age=31536000, immutable",
      })
    );
  }
}
