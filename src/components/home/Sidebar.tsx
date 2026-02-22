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

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
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

  return (
    <aside className="space-y-8 font-sans">
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
