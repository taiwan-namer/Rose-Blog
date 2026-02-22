"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface PostData {
  id: string;
  title: string;
  content: string;
  coverImageUrl: string;
  publishedAt: string;
}

const STORAGE_KEY = "joyseed_posts";

const SHICHEN = [
  { key: "子", range: "23:00-00:59" },
  { key: "丑", range: "01:00-02:59" },
  { key: "寅", range: "03:00-04:59" },
  { key: "卯", range: "05:00-06:59" },
  { key: "辰", range: "07:00-08:59" },
  { key: "巳", range: "09:00-10:59" },
  { key: "午", range: "11:00-12:59" },
  { key: "未", range: "13:00-14:59" },
  { key: "申", range: "15:00-16:59" },
  { key: "酉", range: "17:00-18:59" },
  { key: "戌", range: "19:00-20:59" },
  { key: "亥", range: "21:00-22:59" },
];

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [destinyForm, setDestinyForm] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    isTimeUnknown: false,
  });
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
    if (!destinyForm.isTimeUnknown && !destinyForm.birthTime) {
      setDestinyError("請選擇出生時辰，或勾選「不知道」");
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
      birthTime: destinyForm.isTimeUnknown ? "" : destinyForm.birthTime,
      isTimeUnknown: destinyForm.isTimeUnknown,
    };

    try {
      const jsonString = JSON.stringify(payload);
      const encodedData = btoa(encodeURIComponent(jsonString));
      router.push(`/destinymap/result?data=${encodedData}`);
    } catch {
      setDestinyError("資料處理錯誤，請重試");
    }
  };

  return (
    <aside className="space-y-8 font-sans">
      {/* DestinyMap - 直接跳算命結果 */}
      <div>
        <Link
          href="/destinymap"
          className="mb-3 block text-xl font-bold text-gray-800 hover:text-sky-blue-dark hover:underline"
        >
          DestinyMap 神秘的紫薇斗數
        </Link>
        <form onSubmit={handleDestinyMapSubmit} className="space-y-3">
          <input
            type="text"
            value={destinyForm.name}
            onChange={(e) => setDestinyForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="姓名"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-sky-blue focus:outline-none"
          />
          <input
            type="date"
            value={destinyForm.birthDate}
            onChange={(e) => setDestinyForm((p) => ({ ...p, birthDate: e.target.value }))}
            max={new Date().toISOString().split("T")[0]}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-sky-blue focus:outline-none [color-scheme:light]"
          />
          <select
            value={destinyForm.birthTime}
            onChange={(e) => setDestinyForm((p) => ({ ...p, birthTime: e.target.value }))}
            disabled={destinyForm.isTimeUnknown}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-sky-blue focus:outline-none disabled:opacity-50 [color-scheme:light]"
          >
            <option value="">選擇時辰</option>
            {SHICHEN.map(({ key, range }) => (
              <option key={key} value={key}>
                {key} {range}
              </option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={destinyForm.isTimeUnknown}
              onChange={(e) =>
                setDestinyForm((p) => ({
                  ...p,
                  isTimeUnknown: e.target.checked,
                  birthTime: e.target.checked ? "" : p.birthTime,
                }))
              }
              className="rounded border-gray-300"
            />
            不知道確切時辰（以午時推算）
          </label>
          {destinyError && (
            <p className="text-sm text-red-600">{destinyError}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            揭開命運之旅
          </button>
        </form>
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
