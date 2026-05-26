import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileDashboardTab } from "@/components/profile/tabs/ProfileDashboardTab";
import { getProfileDashboardData } from "@/lib/profile/dashboardData";

export default async function ProfileDashboardPage() {
  const session = await auth();
  if (!session?.user?.channelId) {
    redirect("/login?callbackUrl=/profile");
  }

  const initialData = await getProfileDashboardData(session.user.channelId);

  return <ProfileDashboardTab initialData={initialData} />;
}
