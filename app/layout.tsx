import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelMind AI — Free AI Image Generator",
  description: "Generate stunning AI images for free using PixelMind AI. Powered by Pollinations.ai",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
