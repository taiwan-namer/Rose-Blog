"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PostGridCard from "./PostGridCard";
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

const PLACEHOLDER_POSTS = [
  {
    title: "【宜蘭景點】蠟筆城堡，繽紛色彩親子同樂",
    excerpt: "超夢幻的蠟筆城堡，讓孩子盡情揮灑想像力！",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
    href: "#",
  },
  {
    title: "【親子生活】紫色系穿搭分享",
    excerpt: "母女同款紫色穿搭，穿出親子間的默契與美好時光。",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
    href: "#",
  },
  {
    title: "【台北探險】室內親子館雨天備案",
    excerpt: "雨天備案首選！台北室內親子館推薦。",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80",
    href: "#",
  },
];

type MappedPost = {
  title: string;
  excerpt: string;
  image: string;
  href: string;
  tag?: string;
};

export default function FeaturedPostsGrid() {
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get("tag") || "";
  const searchQuery = searchParams.get("q")?.toLowerCase().trim() || "";
  const [posts, setPosts] = useState<MappedPost[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored: PostData[] = raw ? JSON.parse(raw) : [];
      if (stored.length > 0) {
        setPosts(
          stored.map((p) => {
            const html = p.content || "";
            const beforeFirstImg = html.split(/<img/i)[0] || "";
            const excerpt =
              beforeFirstImg
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 80) || "（無內文）";
            return {
              title: p.title,
              excerpt,
              image: p.coverImageUrl,
              href: `/admin/posts/${p.id}`,
              tag: p.tag,
            };
          })
        );
      } else {
        setPosts(PLACEHOLDER_POSTS);
      }
    } catch {
      setPosts(PLACEHOLDER_POSTS);
    }
  }, []);

  if (posts === null) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    );
  }

  let filteredPosts = posts;
  if (tagFilter) {
    filteredPosts = filteredPosts.filter((p) => p.tag === tagFilter);
  }
  if (searchQuery) {
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery) ||
        p.excerpt.toLowerCase().includes(searchQuery)
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        {tagFilter ? (
          `尚無「${getTagLabel(tagFilter)}」分類的文章`
        ) : searchQuery ? (
          `找不到符合「${searchQuery}」的文章`
        ) : (
          <>
            尚無文章，前往{" "}
            <Link href="/admin/new-post" className="text-sky-blue hover:underline">
              發佈新文章
            </Link>{" "}
            建立第一篇文章吧
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {filteredPosts.map((post) => (
        <PostGridCard
          key={post.title + post.href}
          title={post.title}
          excerpt={post.excerpt}
          image={post.image}
          href={post.href}
        />
      ))}
    </div>
  );
}
