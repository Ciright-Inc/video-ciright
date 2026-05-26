import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileHistoryTab } from "@/components/profile/tabs/ProfileHistoryTab";
import { getWatchHistoryPage } from "@/lib/profile/watchHistoryPage";

export default async function ProfileHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile/history");
  }

  const initialPage = await getWatchHistoryPage(session.user.id, 1);

  return <ProfileHistoryTab initialPage={initialPage} />;
}
