import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const siteDescription =
  "Stream, upload, and discover videos on Ciright Video—a modern platform for channels, playback, and content management.";

export const metadata: Metadata = {
  title: "Ciright Video",
  description: siteDescription,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
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
    <html lang="en" className={cn("h-full antialiased", "font-sans")}>
      <body className="h-dvh flex flex-col overflow-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
