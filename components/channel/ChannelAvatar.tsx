import { Avatar } from "@/components/ui/user-avatar";

interface ChannelAvatarProps {
  src?: string | null;
  name: string;
}

export function ChannelAvatar({ src, name }: ChannelAvatarProps) {
  return (
    <div className="-mt-12 relative z-10 ml-4 rounded-full border-4 border-canvas">
      <Avatar src={src} name={name} size="xl" />
    </div>
  );
}
