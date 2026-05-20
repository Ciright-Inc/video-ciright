import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  buildInternalObjectUrl,
  buildChannelAssetKey,
  isAllowedImageContentType,
  uploadObject,
} from "@/lib/s3";

const AVATAR_MAX_BYTES = 10 * 1024 * 1024;
const BANNER_MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.channelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const assetType = form.get("assetType");
    const file = form.get("file");

    if (assetType !== "avatar" && assetType !== "banner") {
      return NextResponse.json(
        { error: "assetType must be avatar or banner" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const maxBytes = assetType === "avatar" ? AVATAR_MAX_BYTES : BANNER_MAX_BYTES;
    if (file.size <= 0 || file.size > maxBytes) {
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

    if (!isAllowedImageContentType(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image format" },
        { status: 400 }
      );
    }

    const key = buildChannelAssetKey(
      session.user.channelId,
      assetType,
      file.name
    );

    const body = Buffer.from(await file.arrayBuffer());
    await uploadObject({
      key,
      contentType: file.type,
      body,
    });

    return NextResponse.json({
      key,
      publicUrl: buildInternalObjectUrl(key),
    });
  } catch (err) {
    console.error("Channel asset upload failed:", err);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
