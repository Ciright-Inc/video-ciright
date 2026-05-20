import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChannelById } from "@/lib/data/channels";
import { ChannelForm } from "@/components/profile/ChannelForm";

export default async function ProfileChannelPage() {
  const session = await auth();
  if (!session?.user?.channelId) {
    redirect("/login?callbackUrl=/profile/channel");
  }

  const channel = await getChannelById(session.user.channelId);
  if (!channel) notFound();

  return (
    <div>
      <ChannelForm
        channelId={channel.id}
        initial={{
          name: channel.name,
          handle: channel.handle,
          description: channel.description,
          avatarUrl: channel.avatarUrl,
          bannerUrl: channel.bannerUrl,
        }}
      />
    </div>
  );
}
