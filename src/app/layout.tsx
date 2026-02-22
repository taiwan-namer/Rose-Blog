import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rose's Blog",
    template: "%s | Rose's Blog",
  },
  description:
    "Rose's Blog，帶孩子看見不一樣的世界。親子探險，分享宜蘭景點、親子生活與溫馨日常。",
  keywords: ["Rose's Blog", "親子旅遊", "宜蘭景點", "親子生活", "Joyseed Island"],
  authors: [{ name: "Rose's Blog" }],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "Rose's Blog",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${notoSansTC.variable} font-sans antialiased`}
      >
        <Navbar />
        <main className="min-h-screen bg-white">{children}</main>
      </body>
    </html>
  );
}
