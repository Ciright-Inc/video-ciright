import Image from "next/image";

interface ChannelBannerProps {
  bannerUrl?: string | null;
  name: string;
}

export function ChannelBanner({ bannerUrl, name }: ChannelBannerProps) {
  return (
    <div className="relative h-32 w-full overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-r from-[var(--color-gradient-sky-light)] to-[var(--color-gradient-sky-mid)] sm:h-48">
      {bannerUrl && (
        <Image
          src={bannerUrl}
          alt={`${name} banner`}
          fill
          className="object-cover"
          unoptimized
        />
      )}
    </div>
  );
}
