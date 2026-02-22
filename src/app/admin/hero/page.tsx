"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const STORAGE_KEY = "joyseed_hero_images";
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const QUALITY = 0.85;

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
        resolve(file);
        return;
      }
      const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
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
        QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

async function uploadToR2(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "上傳失敗");
  if (!data.success || !data.url) throw new Error("上傳回應格式錯誤");
  return data.url;
}

function getStoredUrls(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUrls(urls: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  window.dispatchEvent(new Event("storage"));
}

export default function HeroManagePage() {
  const [urls, setUrls] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUrls(getStoredUrls());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (!f.type.startsWith("image/")) {
        setError("請選擇圖片檔案（JPG、PNG、GIF、WebP、AVIF）");
        setFile(null);
        return;
      }
      setFile(f);
      setError(null);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("請先選擇圖片");
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const url = await uploadToR2(compressed);
      const next = [...urls, url];
      setUrls(next);
      saveUrls(next);
      setFile(null);
      (document.getElementById("hero-file") as HTMLInputElement).value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "上傳失敗");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const next = urls.filter((_, i) => i !== index);
    setUrls(next);
    saveUrls(next);
  };

  const handleMove = (index: number, dir: "up" | "down") => {
    const next = [...urls];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setUrls(next);
    saveUrls(next);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">輪播圖管理</h1>
      <p className="mb-8 text-sm text-gray-500">
        上傳圖片會自動壓縮並上傳至 R2，首頁輪播將顯示以下圖片（依序播放）
      </p>

      <div className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="hero-file"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          上傳輪播圖
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id="hero-file"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            onChange={handleFileChange}
            className="block text-sm text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-sky-blue file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-sky-blue-dark"
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="rounded-lg bg-sky-blue px-4 py-2 text-sm font-medium text-white hover:bg-sky-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? "上傳中..." : "上傳"}
          </button>
        </div>
        {file && (
          <p className="mt-2 text-xs text-gray-500">
            已選：{file.name}（{(file.size / 1024).toFixed(1)} KB）
          </p>
        )}
        {error && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {urls.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-gray-500">尚無輪播圖</p>
          <p className="mt-1 text-sm text-gray-400">
            上傳圖片後，首頁輪播將顯示您上傳的圖片
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {urls.map((url, i) => (
            <li
              key={url}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <span className="w-8 shrink-0 text-sm font-medium text-gray-500">
                {i + 1}
              </span>
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={url}
                  alt={`輪播圖 ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={url.includes("r2.dev")}
                  sizes="96px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-gray-500">{url}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(i, "up")}
                  disabled={i === 0}
                  className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                  aria-label="上移"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(i, "down")}
                  disabled={i === urls.length - 1}
                  className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                  aria-label="下移"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="rounded p-1.5 text-red-600 hover:bg-red-50"
                  aria-label="刪除"
                >
                  刪除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8">
        <Link href="/" className="text-sky-blue hover:underline">
          ← 返回首頁
        </Link>
      </p>
    </div>
  );
}
