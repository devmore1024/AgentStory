import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgenTales - 让你的分身回到童话里",
  description: "让你的 AI 分身带着真实的你，回到童话里"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen text-[var(--text-primary)] antialiased">{children}</body>
    </html>
  );
}
