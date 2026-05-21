import { createReadStream, createWriteStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { ReadableStream } from "node:stream/web";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function awsCredentials() {
  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY;
  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "AWS credentials missing (set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY)"
    );
  }

  return { accessKeyId, secretAccessKey };
}

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: requireEnv("AWS_REGION"),
      credentials: awsCredentials(),
    });
  }
  return s3Client;
}

export function getS3Bucket(): string {
  return process.env.AWS_S3_BUCKET ?? "video-ciright";
}

/** @deprecated Use buildVideoOriginalKey / buildVideoThumbnailKey */
export function buildObjectKey(channelId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `videos/${channelId}/${Date.now()}-${safeName}`;
}

function extensionFromFileName(fileName: string): string {
  const ext = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase()
    : "";
  if (ext && /^[a-z0-9]+$/.test(ext)) return ext;
  return "mp4";
}

export function buildVideoOriginalKey(
  channelId: string,
  videoId: string,
  fileName: string
): string {
  const ext = extensionFromFileName(fileName);
  return `videos/${channelId}/${videoId}/original.${ext}`;
}

export function buildVideoThumbnailKey(
  channelId: string,
  videoId: string,
  fileName: string
): string {
  const ext = extensionFromFileName(fileName);
  return `videos/${channelId}/${videoId}/thumbnail.${ext}`;
}

export function buildHlsPrefix(channelId: string, videoId: string): string {
  return `videos/${channelId}/${videoId}/hls/`;
}

export function buildHlsMasterKey(channelId: string, videoId: string): string {
  return `${buildHlsPrefix(channelId, videoId)}master.m3u8`;
}

export function buildChannelAssetKey(
  channelId: string,
  assetType: "avatar" | "banner",
  fileName: string
): string {
  const ext =
    fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : "";
  const safeExt = ext && /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
  return `channels/${channelId}/${assetType}-${Date.now()}.${safeExt}`;
}

export function getPublicObjectUrl(key: string): string {
  const base = process.env.AWS_S3_PUBLIC_URL_BASE?.replace(/\/$/, "");
  if (base) return `${base}/${key}`;

  const bucket = getS3Bucket();
  const region = requireEnv("AWS_REGION");
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

const VIDEO_CONTENT_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "application/vnd.apple.mpegurl",
]);

export function isAllowedVideoContentType(contentType: string): boolean {
  return VIDEO_CONTENT_TYPES.has(contentType);
}

const IMAGE_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isAllowedImageContentType(contentType: string): boolean {
  return IMAGE_CONTENT_TYPES.has(contentType);
}

/** If `url` is an object in our bucket (matching public URL patterns), return the S3 object key. */
export function tryExtractKeyFromPublicObjectUrl(url: string): string | null {
  const internalPrefix = "/api/upload/object/";
  if (url.startsWith(internalPrefix)) {
    return decodeURIComponent(url.slice(internalPrefix.length));
  }

  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith(internalPrefix)) {
      return decodeURIComponent(parsed.pathname.slice(internalPrefix.length));
    }
  } catch {
    // Ignore invalid URL and continue with bucket URL extraction.
  }

  const base = process.env.AWS_S3_PUBLIC_URL_BASE?.replace(/\/$/, "");
  if (base && url.startsWith(`${base}/`)) {
    return decodeURIComponent(url.slice(base.length + 1));
  }
  try {
    const bucket = getS3Bucket();
    const region = process.env.AWS_REGION;
    if (!region) return null;
    const prefix = `https://${bucket}.s3.${region}.amazonaws.com/`;
    if (url.startsWith(prefix)) {
      return decodeURIComponent(url.slice(prefix.length));
    }
  } catch {
    return null;
  }
  return null;
}

export async function createPresignedUploadUrl(options: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getS3Bucket(),
    Key: options.key,
    ContentType: options.contentType,
  });

  return getSignedUrl(getS3Client(), command, {
    expiresIn: options.expiresIn ?? 3600,
  });
}

export async function uploadObject(options: {
  key: string;
  contentType: string;
  body: Buffer | Uint8Array | string;
}): Promise<void> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: options.key,
      Body: options.body,
      ContentType: options.contentType,
    })
  );
}

/** Stream a browser File to S3 without loading it entirely into memory. */
export async function uploadObjectFromFile(options: {
  key: string;
  contentType: string;
  file: File;
}): Promise<void> {
  const body = Readable.fromWeb(
    options.file.stream() as ReadableStream<Uint8Array>
  );

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: options.key,
      Body: body,
      ContentLength: options.file.size,
      ContentType: options.contentType,
    })
  );
}

export function buildInternalObjectUrl(key: string): string {
  const encodedKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `/api/upload/object/${encodedKey}`;
}

export async function getObject(options: { key: string }) {
  return getS3Client().send(
    new GetObjectCommand({
      Bucket: getS3Bucket(),
      Key: options.key,
    })
  );
}

export async function deleteObject(key: string): Promise<void> {
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: getS3Bucket(),
      Key: key,
    })
  );
}

/** Delete all objects under a prefix (e.g. videos/{channelId}/{videoId}/). */
export async function deleteObjectsByPrefix(prefix: string): Promise<void> {
  const bucket = getS3Bucket();
  let continuationToken: string | undefined;

  do {
    const list = await getS3Client().send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    const keys = (list.Contents ?? [])
      .map((obj) => obj.Key)
      .filter((key): key is string => Boolean(key));

    if (keys.length > 0) {
      await getS3Client().send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: keys.map((Key) => ({ Key })) },
        })
      );
    }

    continuationToken = list.IsTruncated
      ? list.NextContinuationToken
      : undefined;
  } while (continuationToken);
}

export function buildVideoAssetPrefix(
  channelId: string,
  videoId: string
): string {
  return `videos/${channelId}/${videoId}/`;
}

export async function downloadObjectToFile(
  key: string,
  destPath: string
): Promise<void> {
  const response = await getObject({ key });

  if (!response.Body) {
    throw new Error(`S3 object not found: ${key}`);
  }

  await pipeline(
    response.Body as NodeJS.ReadableStream,
    createWriteStream(destPath)
  );
}

function contentTypeForHlsFile(filePath: string): string {
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
      await uploadDirectoryToS3(localPath, `${s3Prefix}${entry.name}/`);
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
        ContentType: contentTypeForHlsFile(localPath),
        CacheControl: entry.name.endsWith(".m3u8")
          ? "public, max-age=60"
          : "public, max-age=31536000, immutable",
      })
    );
  }
}
