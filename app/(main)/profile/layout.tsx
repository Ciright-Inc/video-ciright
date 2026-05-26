import { ProfilePageContent } from "@/components/profile/ProfilePageContent";
import { ProfilePrefetch } from "@/components/profile/ProfilePrefetch";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-w-0 max-w-6xl">
      <ProfilePrefetch />
      <h1 className="mb-1 text-2xl font-bold text-ink">Creator hub</h1>
      <p className="mb-4 text-sm text-secondary-foreground">
        Manage your channel, videos, analytics, watch history, and saved videos.
      </p>
      <ProfileTabs />
      <ProfilePageContent>{children}</ProfilePageContent>
    </div>
  );
}
