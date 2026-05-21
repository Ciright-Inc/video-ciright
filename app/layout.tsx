import type { Metadata } from "next";
import "@/styles/globals.css";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const siteDescription =
  "Stream, upload, and discover videos on Ciright Video—a modern platform for channels, playback, and content management.";

export const metadata: Metadata = {
  title: "Ciright Video",
  description: siteDescription,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  openGraph: {
    title: "Ciright Video",
    description: siteDescription,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ciright Video",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="h-dvh flex flex-col overflow-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
