import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProfileChannelData } from "@/lib/profile/channelProfileData";

export async function GET() {
  const session = await auth();
  if (!session?.user?.channelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getProfileChannelData(
    session.user.id,
    session.user.channelId
  );
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
