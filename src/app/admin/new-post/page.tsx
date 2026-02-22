"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

import "react-quill/dist/quill.snow.css";
import { TAG_OPTIONS } from "@/lib/tags";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg border border-gray-300 bg-gray-50">
      <span className="text-gray-500">載入編輯器...</span>
    </div>
  ),
});

interface PostData {
  id: string;
  title: string;
  content: string;
  coverImageUrl: string;
  publishedAt: string;
  tag: string;
}

const STORAGE_KEY = "joyseed_posts";
const MAX_COVER_WIDTH = 1920;
const MAX_COVER_HEIGHT = 1080;
const COVER_QUALITY = 0.85;

/** 將首圖壓縮至網頁尺寸，維持比例不裁切 */
async function compressCoverImage(file: File): Promise<File> {
  return new Promise<File>((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width <= MAX_COVER_WIDTH && height <= MAX_COVER_HEIGHT) {
        resolve(file);
        return;
      }

      const ratio = Math.min(MAX_COVER_WIDTH / width, MAX_COVER_HEIGHT / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const ext = file.name.split(".").pop() || "jpg";
          const name = file.name.replace(/\.[^.]+$/, `-compressed.${ext}`);
          resolve(new File([blob], name, { type: mime }));
        },
        mime,
        COVER_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

function getStoredPosts(): PostData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePostToStorage(post: PostData) {
  const posts = getStoredPosts();
  posts.unshift(post);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedPost, setPublishedPost] = useState<PostData | null>(null);

  const editorWrapperRef = useRef<HTMLDivElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("請選擇圖片檔案（JPG、PNG、GIF、WebP、AVIF）");
        setCoverFile(null);
        return;
      }
      setCoverFile(file);
      setError(null);
    } else {
      setCoverFile(null);
    }
  };

  const uploadImageToR2 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "圖片上傳失敗");
    }

    if (!data.success || !data.url) {
      throw new Error("圖片上傳回應格式錯誤");
    }

    return data.url;
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/jpeg,image/png,image/gif,image/webp,image/avif");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("請選擇圖片檔案（JPG、PNG、GIF、WebP、AVIF）");
        return;
      }

      const wrapper = editorWrapperRef.current;
      if (!wrapper) return;
      const container = wrapper.querySelector(".ql-container");
      if (!container) return;

      const Quill = (await import("quill")).default;
      const quill = Quill.find(container as HTMLElement);
      if (!quill) return;

      const range = quill.getSelection(true);
      const insertIndex = range ? range.index : 0;
      setIsImageUploading(true);
      setError(null);

      try {
        const url = await uploadImageToR2(file);
        quill.insertEmbed(insertIndex, "image", url);
        quill.setSelection(insertIndex + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "內文圖片上傳失敗");
      } finally {
        setIsImageUploading(false);
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ["bold", "italic"],
          [{ header: [1, 2, 3, false] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["image"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  const formats = [
    "bold",
    "italic",
    "header",
    "list",
    "bullet",
    "image",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPublishedPost(null);

    if (!title.trim()) {
      setError("請填寫文章標題");
      return;
    }

    if (!coverFile) {
      setError("請選擇首圖");
      return;
    }

    if (!tag) {
      setError("請選擇標籤");
      return;
    }

    setIsSubmitting(true);

    try {
      const compressedCover = await compressCoverImage(coverFile);
      const coverImageUrl = await uploadImageToR2(compressedCover);

      const post: PostData = {
        id: `post-${Date.now()}`,
        title: title.trim(),
        content, // Quill 產生的 HTML
        coverImageUrl,
        publishedAt: new Date().toISOString(),
        tag,
      };

      savePostToStorage(post);
      setPublishedPost(post);

      setTitle("");
      setTag("");
      setContent("");
      setCoverFile(null);
      const fileInput = document.getElementById("cover-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "發佈失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-800">發佈新文章</h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-md">
        {/* 標籤（對應導航選單） */}
        <div>
          <label htmlFor="tag" className="mb-2 block text-sm font-medium text-gray-700">
            標籤
          </label>
          <select
            id="tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-sky-blue focus:outline-none focus:ring-2 focus:ring-sky-blue/20"
            disabled={isSubmitting}
          >
            <option value="">請選擇標籤（對應上方導航項目）</option>
            {TAG_OPTIONS.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* 文章標題 */}
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
            文章標題
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="輸入文章標題"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-sky-blue focus:outline-none focus:ring-2 focus:ring-sky-blue/20"
            disabled={isSubmitting}
          />
        </div>

        {/* 文章內容 - 富文本編輯器 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            文章內容
          </label>
          {isImageUploading && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-sky-blue/10 px-4 py-2 text-sm text-sky-blue-dark">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-blue border-t-transparent" />
              圖片上傳中...
            </div>
          )}
          <div
            ref={editorWrapperRef}
            className="quill-editor-wrapper [&_.ql-container]:min-h-[280px] [&_.ql-editor]:min-h-[260px]"
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="輸入文章內容..."
              className="rounded-lg [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:rounded-b-lg"
              readOnly={isSubmitting}
            />
          </div>
        </div>

        {/* 首圖上傳 */}
        <div>
          <label htmlFor="cover-input" className="mb-2 block text-sm font-medium text-gray-700">
            首圖上傳
          </label>
          <input
            id="cover-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            onChange={handleCoverChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-blue file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-sky-blue-dark"
            disabled={isSubmitting}
          />
          {coverFile && (
            <p className="mt-1 text-xs text-gray-500">
              已選：{coverFile.name}（{(coverFile.size / 1024).toFixed(1)} KB）
            </p>
          )}
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* 發佈按鈕 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-sky-blue py-4 text-lg font-bold text-white transition-colors hover:bg-sky-blue-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "上傳中..." : "發佈文章"}
        </button>
      </form>

      {/* 發佈成功提示與預覽 */}
      {publishedPost && (
        <div className="mt-12">
          <p className="mb-6 text-center text-xl font-bold text-green-600">
            ✅ 發佈成功！
          </p>
          <p className="mb-6 text-center">
            <Link
              href="/admin/posts"
              className="text-sky-blue hover:underline"
            >
              查看所有已發佈文章 →
            </Link>
          </p>

          <article className="overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="relative aspect-video w-full">
              <Image
                src={publishedPost.coverImageUrl}
                alt={publishedPost.title}
                fill
                className="object-cover"
                unoptimized={publishedPost.coverImageUrl.includes("r2.dev")}
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
            <div className="p-6">
              <time className="text-sm text-gray-500">
                {new Date(publishedPost.publishedAt).toLocaleDateString("zh-TW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {publishedPost.title}
              </h2>
              <div
                className="article-content mt-4"
                dangerouslySetInnerHTML={{
                  __html: publishedPost.content || "<p>（無內文）</p>",
                }}
              />
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
