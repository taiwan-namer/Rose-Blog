"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PostListItem from "./PostListItem";
import { getTagLabel } from "@/lib/tags";

interface PostData {
  id: string;
  title: string;
  content: string;
  coverImageUrl: string;
  publishedAt: string;
  tag?: string;
}

const STORAGE_KEY = "joyseed_posts";

type MappedPost = {
  title: string;
  category: string;
  excerpt: string;
  image: string;
  href: string;
  tag?: string;
  date: string;
};

function mapStoredToDisplay(stored: PostData[]): MappedPost[] {
  return stored.map((p) => ({
    title: p.title,
    category: p.tag ? getTagLabel(p.tag) : "精選",
    excerpt:
      (() => {
        const html = p.content || "";
        const beforeFirstImg = html.split(/<img/i)[0] || "";
        return beforeFirstImg
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim() || "（無內文）";
      })(),
    image: p.coverImageUrl,
    href: `/admin/posts/${p.id}`,
    tag: p.tag,
    date: new Date(p.publishedAt).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, "."),
  }));
}

export default function FeaturedPosts() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q")?.toLowerCase().trim() || "";
  const tagFilter = searchParams.get("tag") || "";
  const [posts, setPosts] = useState<MappedPost[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored: PostData[] = raw ? JSON.parse(raw) : [];
      setPosts(mapStoredToDisplay(stored));
    } catch {
      setPosts([]);
    }
  }, []);

  if (posts === null) {
    return <div className="h-48 animate-pulse rounded bg-gray-100" />;
  }

  let filteredPosts = posts;
  if (tagFilter) {
    filteredPosts = filteredPosts.filter((p) => (p as { tag?: string }).tag === tagFilter);
  }
  if (searchQuery) {
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(searchQuery))
    );
  }

  return (
    <div className="space-y-10 font-sans">
      {filteredPosts.length === 0 ? (
        <div className="py-8 text-center text-base leading-loose text-gray-500">
          {tagFilter ? (
            `尚無「${getTagLabel(tagFilter)}」分類的文章`
          ) : searchQuery ? (
            `找不到符合「${searchQuery}」的文章`
          ) : (
            <>
              尚無文章，前往{" "}
              <Link href="/admin/new-post" className="text-base text-sky-blue hover:underline">
                發佈新文章
              </Link>{" "}
              建立第一篇文章吧
            </>
          )}
        </div>
      ) : (
        filteredPosts.map((post) => (
          <PostListItem
            key={post.title + post.href}
            title={post.title}
            category={post.category}
            excerpt={post.excerpt}
            image={post.image}
            href={post.href}
            date={post.date}
          />
        ))
      )}
    </div>
  );
}
