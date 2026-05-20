import type { Metadata } from "next";
import "@/styles/globals.css";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Ciright Video",
  description: "A YouTube-like video platform",
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
