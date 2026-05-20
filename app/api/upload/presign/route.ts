import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  buildChannelAssetKey,
  buildObjectKey,
  createPresignedUploadUrl,
  getPublicObjectUrl,
  isAllowedImageContentType,
  isAllowedVideoContentType,
} from "@/lib/s3";

const VIDEO_MAX_BYTES = 1024 * 1024 * 1024;
const THUMBNAIL_MAX_BYTES = 10 * 1024 * 1024;
const AVATAR_MAX_BYTES = 10 * 1024 * 1024;
const BANNER_MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.channelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      fileName,
      contentType,
      fileSize,
      kind = "video",
      assetType,
    } = body as {
      fileName?: string;
      contentType?: string;
      fileSize?: number;
      kind?: "video" | "thumbnail" | "channel-asset";
      assetType?: "avatar" | "banner";
    };

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 }
      );
    }

    if (fileSize == null || fileSize <= 0) {
      return NextResponse.json(
        { error: "File size is required and must be greater than zero" },
        { status: 413 }
      );
    }

    if (kind === "video") {
      if (fileSize > VIDEO_MAX_BYTES) {
        return NextResponse.json(
          { error: "File exceeds 1 GB limit" },
          { status: 413 }
        );
      }
      if (!isAllowedVideoContentType(contentType)) {
        return NextResponse.json(
          { error: "Unsupported video format" },
          { status: 400 }
        );
      }
      const key = buildObjectKey(session.user.channelId, fileName);
      const uploadUrl = await createPresignedUploadUrl({ key, contentType });
      const publicUrl = getPublicObjectUrl(key);
      return NextResponse.json({ uploadUrl, key, publicUrl });
    }

    if (kind === "thumbnail") {
      if (fileSize > THUMBNAIL_MAX_BYTES) {
        return NextResponse.json(
          { error: "Thumbnail exceeds 10 MB limit" },
          { status: 413 }
        );
      }
      if (!isAllowedImageContentType(contentType)) {
        return NextResponse.json(
          { error: "Unsupported image format" },
          { status: 400 }
        );
      }
      const key = buildObjectKey(session.user.channelId, fileName);
      const uploadUrl = await createPresignedUploadUrl({ key, contentType });
      const publicUrl = getPublicObjectUrl(key);
      return NextResponse.json({ uploadUrl, key, publicUrl });
    }

    if (kind === "channel-asset") {
      if (assetType !== "avatar" && assetType !== "banner") {
        return NextResponse.json(
          { error: "assetType must be avatar or banner" },
          { status: 400 }
        );
      }
      const maxBytes =
        assetType === "avatar" ? AVATAR_MAX_BYTES : BANNER_MAX_BYTES;
      if (fileSize > maxBytes) {
        return NextResponse.json(
          {
            error:
              assetType === "avatar"
                ? "Avatar exceeds 10 MB limit"
                : "Banner exceeds 50 MB limit",
          },
          { status: 413 }
        );
      }
      if (!isAllowedImageContentType(contentType)) {
        return NextResponse.json(
          { error: "Unsupported image format" },
          { status: 400 }
        );
      }
      const key = buildChannelAssetKey(
        session.user.channelId,
        assetType,
        fileName
      );
      const uploadUrl = await createPresignedUploadUrl({ key, contentType });
      const publicUrl = getPublicObjectUrl(key);
      return NextResponse.json({ uploadUrl, key, publicUrl });
    }

    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  } catch (err) {
    console.error("Presign failed:", err);
    return NextResponse.json(
      { error: "Failed to prepare upload" },
      { status: 500 }
    );
  }
}
