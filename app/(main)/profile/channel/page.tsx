import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChannelById } from "@/lib/data/channels";
import { prisma } from "@/lib/prisma";
import { ChannelForm } from "@/components/profile/ChannelForm";
import { UserCountryForm } from "@/components/profile/UserCountryForm";

export default async function ProfileChannelPage() {
  const session = await auth();
  if (!session?.user?.channelId) {
    redirect("/login?callbackUrl=/profile/channel");
  }

  const channel = await getChannelById(session.user.channelId);
  if (!channel) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { countryCode: true },
  });

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
      <UserCountryForm initialCountryCode={user?.countryCode ?? null} />
    </div>
  );
}
