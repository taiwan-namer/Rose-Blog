"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface PostData {
  id: string;
  title: string;
  content: string;
  coverImageUrl: string;
  publishedAt: string;
}

const STORAGE_KEY = "joyseed_posts";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostData[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setPosts(raw ? JSON.parse(raw) : []);
    } catch {
      setPosts([]);
    }
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">已發佈文章</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/hero"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            輪播圖管理
          </Link>
          <Link
            href="/admin/new-post"
            className="rounded-lg bg-sky-blue px-4 py-2 text-sm font-medium text-white hover:bg-sky-blue-dark"
          >
            ＋ 發佈新文章
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-gray-500">尚無文章</p>
          <p className="mt-2 text-sm text-gray-400">
            前往「發佈新文章」建立第一篇文章吧
          </p>
          <Link
            href="/admin/new-post"
            className="mt-4 inline-block text-sky-blue hover:underline"
          >
            發佈新文章 →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md sm:flex-row"
            >
              <div className="relative h-48 w-full shrink-0 sm:h-40 sm:w-64">
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  unoptimized={post.coverImageUrl.includes("r2.dev")}
                  sizes="256px"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center p-5">
                <time className="text-xs text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString("zh-TW")}
                </time>
                <h2 className="mt-1 text-lg font-bold text-gray-800">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {post.content
                    ?.replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 80) || "（無內文）"}
                  {(post.content?.length ?? 0) > 80 ? "..." : ""}
                </p>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="mt-3 text-sm text-sky-blue hover:underline"
                >
                  查看全文 →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
