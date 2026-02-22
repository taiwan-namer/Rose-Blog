"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Moon } from "lucide-react";

interface PostData {
  id: string;
  title: string;
  content: string;
  coverImageUrl: string;
  publishedAt: string;
}

const STORAGE_KEY = "joyseed_posts";

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [destinyForm, setDestinyForm] = useState({ name: "", birthDate: "" });
  const [destinyError, setDestinyError] = useState("");
  const [latestPosts, setLatestPosts] = useState<PostData[]>([]);

  const loadLatestPosts = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setLatestPosts(raw ? JSON.parse(raw) : []);
    } catch {
      setLatestPosts([]);
    }
  };

  useEffect(() => {
    loadLatestPosts();
    window.addEventListener("storage", loadLatestPosts);
    return () => window.removeEventListener("storage", loadLatestPosts);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  };

  const handleDestinyMapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDestinyError("");
    if (!destinyForm.name.trim()) {
      setDestinyError("請輸入姓名");
      return;
    }
    if (!destinyForm.birthDate) {
      setDestinyError("請選擇出生日期");
      return;
    }
    const birthDate = new Date(destinyForm.birthDate);
    if (birthDate > new Date()) {
      setDestinyError("無法讀取未出生者的未來");
      return;
    }
    const payload = {
      name: destinyForm.name.trim(),
      birthPlace: "",
      birthDate: destinyForm.birthDate,
      birthTime: "",
      isTimeUnknown: true,
    };
    try {
      const encodedData = btoa(encodeURIComponent(JSON.stringify(payload)));
      router.push(`/destinymap/result?data=${encodedData}`);
    } catch {
      setDestinyError("資料處理錯誤，請重試");
    }
  };

  return (
    <aside className="space-y-8 font-sans">
      {/* DestinyMap - 高轉換引流卡片 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-6 shadow-lg">
        {/* 右上角神秘發光效果 */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/30 blur-3xl" aria-hidden />
        <div className="relative z-10 space-y-4">
          {/* 月亮 LOGO - 可點擊前往 DestinyMap 頁面 */}
          <Link href="/destinymap" className="flex items-center gap-3 hover:opacity-90">
            <div className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-2">
              <Moon className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">DestinyMap</h3>
              <p className="text-sm text-pink-300">神秘紫微斗數 × 專屬旅行命盤</p>
            </div>
          </Link>
          <p className="text-sm leading-relaxed text-indigo-100">
            沒有靈感下一站去哪玩？結合古老紫微智慧與先進 AI，為你精準推算最適合的開運旅遊地！
          </p>
          <form onSubmit={handleDestinyMapSubmit} className="space-y-3">
            <input
              type="text"
              value={destinyForm.name}
              onChange={(e) => setDestinyForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="姓名"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-indigo-200/60 focus:border-purple-400 focus:outline-none"
            />
            <input
              type="date"
              value={destinyForm.birthDate}
              onChange={(e) => setDestinyForm((p) => ({ ...p, birthDate: e.target.value }))}
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-400 focus:outline-none [color-scheme:dark]"
            />
            {destinyError && <p className="text-xs text-pink-300">{destinyError}</p>}
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
            >
              來趟命運之旅
            </button>
          </form>
        </div>
      </div>

      {/* 文章搜尋 */}
      <div>
        <h3 className="mb-3 text-xl font-bold text-gray-800">文章搜尋</h3>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="輸入關鍵字..."
            className="w-full border-b border-gray-300 bg-transparent px-0 py-2 text-base leading-loose focus:border-sky-blue focus:outline-none"
          />
          <button
            type="submit"
            className="mt-2 text-base font-medium text-sky-blue-dark hover:underline"
          >
            搜尋
          </button>
        </form>
      </div>

      {/* 最新文章 */}
      <div>
        <h3 className="mb-3 text-xl font-bold text-gray-800">最新文章</h3>
        {latestPosts.length === 0 ? (
          <p className="text-base leading-loose text-gray-500">尚無文章</p>
        ) : (
          <ul className="space-y-2">
            {latestPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="line-clamp-2 text-base leading-loose text-gray-800 hover:text-sky-blue-dark hover:underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
