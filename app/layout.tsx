import type { Metadata, Viewport } from "next";
import { Merriweather, Noto_Serif_SC, Nunito_Sans } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather"
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-sc"
});

const nunitoSans = Nunito_Sans({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-nunito-sans"
});

export const metadata: Metadata = {
  title: "AgentStory",
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
    <html lang="zh-CN" className={`${merriweather.variable} ${notoSerifSC.variable} ${nunitoSans.variable}`}>
      <body className="min-h-screen text-[var(--text-primary)] antialiased">{children}</body>
    </html>
  );
}
