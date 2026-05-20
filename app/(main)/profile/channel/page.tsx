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
      <h2 className="mb-2 text-lg font-semibold text-ink">Channel settings</h2>
      <p className="mb-6 text-sm text-body">
        Update how your channel appears to viewers. Upload images or paste URLs.
      </p>
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
