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

const VIDEO_MAX_BYTES = 500 * 1024 * 1024;
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

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
      kind?: "video" | "channel-asset";
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
          { error: "File exceeds 500 MB limit" },
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

    if (kind === "channel-asset") {
      if (fileSize > IMAGE_MAX_BYTES) {
        return NextResponse.json(
          { error: "Image exceeds 10 MB limit" },
          { status: 413 }
        );
      }
      if (assetType !== "avatar" && assetType !== "banner") {
        return NextResponse.json(
          { error: "assetType must be avatar or banner" },
          { status: 400 }
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
