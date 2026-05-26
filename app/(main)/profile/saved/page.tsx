import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileSavedTab } from "@/components/profile/tabs/ProfileSavedTab";
import { getSavedVideosPage } from "@/lib/profile/savedVideosPage";

export default async function ProfileSavedPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile/saved");
  }

  const initialPage = await getSavedVideosPage(session.user.id, 1);

  return <ProfileSavedTab initialPage={initialPage} />;
}
