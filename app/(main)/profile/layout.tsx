import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 text-2xl font-bold text-ink">Creator hub</h1>
      <p className="mb-4 text-sm text-body">
        Manage your channel, videos, analytics, and watch history.
      </p>
      <ProfileTabs />
      {children}
    </div>
  );
}
