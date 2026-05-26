import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProfileDashboardData } from "@/lib/profile/dashboardData";

export async function GET() {
  const session = await auth();
  if (!session?.user?.channelId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getProfileDashboardData(session.user.channelId);
  return NextResponse.json(data);
}
