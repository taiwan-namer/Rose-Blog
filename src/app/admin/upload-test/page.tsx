"use client";

import { useState } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        setErrorMessage("請選擇圖片檔案（JPG、PNG、GIF、WebP、AVIF）");
        setFile(null);
        return;
      }
      setFile(selected);
      setUploadState("idle");
      setErrorMessage(null);
      setImageUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("請先選擇檔案");
      return;
    }

    setUploadState("uploading");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `上傳失敗 (${res.status})`);
      }

      if (!data.success || !data.url) {
        throw new Error(data.error || "上傳回應格式錯誤");
      }

      setImageUrl(data.url);
      setUploadState("success");
    } catch (err) {
      setUploadState("error");
      setErrorMessage(err instanceof Error ? err.message : "上傳失敗");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        圖片上傳測試（R2）
      </h1>

      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label
            htmlFor="file-input"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            選擇圖片
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-rose-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-rose-700 hover:file:bg-rose-100"
          />
          {file && (
            <p className="mt-1 text-xs text-gray-500">
              已選：{file.name}（{(file.size / 1024).toFixed(1)} KB）
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploadState === "uploading"}
          className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploadState === "uploading" ? "上傳中..." : "上傳"}
        </button>

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {uploadState === "success" && imageUrl && (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              上傳成功！
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                圖片 URL（可複製）：
              </p>
              <code className="block break-all rounded bg-gray-100 p-3 text-xs">
                {imageUrl}
              </code>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">預覽：</p>
              <div className="relative aspect-video overflow-hidden rounded-lg border border-gray-200">
                <OptimizedImage
                  src={imageUrl}
                  alt="上傳的圖片"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-500">
        請確認 .env.local 已設定 R2 相關環境變數。支援格式：JPG、PNG、GIF、WebP、AVIF，單檔最大 10MB。
      </p>
    </div>
  );
}
