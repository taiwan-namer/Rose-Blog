"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PostData {
  id: string;
  title: string;
}

const STORAGE_KEY = "joyseed_posts";

export default function HomeSidebar() {
  const [latestPosts, setLatestPosts] = useState<PostData[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) : [];
      setLatestPosts(stored.slice(0, 5).map((p: PostData) => ({ id: p.id, title: p.title })));
    } catch {
      setLatestPosts([]);
    }
  }, []);

  return (
    <aside className="flex w-full flex-col gap-6 lg:w-[340px] lg:shrink-0">
      {/* 關於童趣島 */}
      <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex justify-center">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-slate-100">
            <div className="flex h-full w-full items-center justify-center text-4xl">👤</div>
          </div>
        </div>
        <h3 className="mb-3 text-center text-lg font-bold text-gray-800">關於童趣島</h3>
        <p className="text-center leading-relaxed text-gray-600">
          我是羅老闆，致力於發掘最棒的親子景點。跟著 Rose 的腳步，一起探索台灣的美好！
        </p>
      </div>

      {/* 熱門文章 */}
      <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-gray-800">熱門文章</h3>
        {latestPosts.length === 0 ? (
          <p className="text-sm text-gray-500">尚無文章</p>
        ) : (
          <ul className="space-y-3">
            {latestPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="line-clamp-2 text-sm leading-relaxed text-gray-700 hover:text-sky-blue-dark hover:underline"
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
