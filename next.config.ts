import type { NextConfig } from "next";

function s3ImageRemotePatterns(): { protocol: "https"; hostname: string }[] {
  const patterns: { protocol: "https"; hostname: string }[] = [];
  const publicBase = process.env.AWS_S3_PUBLIC_URL_BASE?.trim();
  if (publicBase) {
    try {
      patterns.push({
        protocol: "https",
        hostname: new URL(publicBase).hostname,
      });
    } catch {
      /* ignore invalid AWS_S3_PUBLIC_URL_BASE */
    }
  }

  const bucket = process.env.AWS_S3_BUCKET ?? "video-ciright";
  const region = process.env.AWS_REGION ?? "us-east-1";
  patterns.push({
    protocol: "https",
    hostname: `${bucket}.s3.${region}.amazonaws.com`,
  });

  return patterns;
}

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "fluent-ffmpeg",
    "ffmpeg-static",
    "ffprobe-static",
    "geoip-lite",
  ],
  experimental: {
    proxyClientMaxBodySize: 1024 * 1024 * 1024,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      ...s3ImageRemotePatterns(),
    ],
  },
};

export default nextConfig;
