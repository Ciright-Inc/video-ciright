import type { Metadata } from "next";
import "@/styles/globals.css";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { productName } from "@/themes/theme.config";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const siteDescription = `Stream, upload, and discover videos on ${productName}—a modern platform for channels, playback, and content management.`;

export const metadata: Metadata = {
  title: productName,
  description: siteDescription,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: productName,
    description: siteDescription,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: productName,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
    >
      <body className="h-dvh flex flex-col overflow-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
