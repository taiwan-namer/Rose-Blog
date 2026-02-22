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
    default: "童趣島 Joyseed Island - 羅老闆與 Rose 的宜蘭探險記",
    template: "%s | 童趣島",
  },
  description:
    "童趣島，帶孩子看見不一樣的世界。羅老闆與 Rose 的親子探險，分享宜蘭景點、親子生活與溫馨日常。",
  keywords: ["童趣島", "親子旅遊", "宜蘭景點", "親子生活", "Joyseed Island"],
  authors: [{ name: "童趣島" }],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "童趣島 Joyseed Island",
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
