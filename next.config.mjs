/** @type {import('next').NextConfig} */

// 從 R2_PUBLIC_DOMAIN 取得 hostname，供 next/image 優化 R2 圖片
let r2Hostname = null;
try {
  const r2Domain = process.env.R2_PUBLIC_DOMAIN || process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || "";
  if (r2Domain) r2Hostname = new URL(r2Domain).hostname;
} catch {
  // R2_PUBLIC_DOMAIN 未設定或格式錯誤時略過
}

const nextConfig = {
  images: {
    remotePatterns: [
      ...(r2Hostname
        ? [
            {
              protocol: "https",
              hostname: r2Hostname,
              pathname: "/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
