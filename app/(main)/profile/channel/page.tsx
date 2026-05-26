import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileChannelTab } from "@/components/profile/tabs/ProfileChannelTab";
import { getProfileChannelData } from "@/lib/profile/channelProfileData";

export default async function ProfileChannelPage() {
  const session = await auth();
  if (!session?.user?.channelId) {
    redirect("/login?callbackUrl=/profile/channel");
  }

  const initialData = await getProfileChannelData(
    session.user.id,
    session.user.channelId
  );
  if (!initialData) notFound();

  return <ProfileChannelTab initialData={initialData} />;
}
