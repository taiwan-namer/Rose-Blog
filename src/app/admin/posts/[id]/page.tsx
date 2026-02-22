"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/components/home/Sidebar";

interface PostData {
  id: string;
  title: string;
  content: string;
  coverImageUrl: string;
  publishedAt: string;
  tag?: string;
}

const STORAGE_KEY = "joyseed_posts";

export default function PostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<PostData | null | undefined>(undefined);

  useEffect(() => {
    const id = params.id as string;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const posts: PostData[] = raw ? JSON.parse(raw) : [];
      setPost(posts.find((p) => p.id === id) ?? null);
    } catch {
      setPost(null);
    }
  }, [params.id]);

  if (post === null) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <p className="text-gray-500">找不到文章</p>
      </div>
    );
  }

  if (post === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="animate-pulse text-gray-400">載入中...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <main className="min-w-0 flex-1">
          <article>
            <time className="block text-base text-gray-500">
              {new Date(post.publishedAt).toLocaleDateString("zh-TW", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h1 className="mt-2 text-2xl font-bold text-gray-800">
              {post.title}
            </h1>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                unoptimized={post.coverImageUrl.includes("r2.dev")}
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
            <div
              className="article-content mt-4"
              dangerouslySetInnerHTML={{
                __html: post.content || "<p>（無內文）</p>",
              }}
            />
          </article>
        </main>
        <aside className="w-full shrink-0 lg:w-72">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}
