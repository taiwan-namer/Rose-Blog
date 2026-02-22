import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

const s3Client = new S3Client({
  region: "auto", // R2 使用 "auto"
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
// 支援 R2_PUBLIC_DOMAIN 或 NEXT_PUBLIC_R2_PUBLIC_DOMAIN
const PUBLIC_DOMAIN =
  process.env.R2_PUBLIC_DOMAIN || process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.slice(lastDot) : "";
}

function generateUniqueFilename(originalName: string): string {
  const ext = getFileExtension(originalName).toLowerCase() || ".jpg";
  const baseName = originalName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_]/g, "-")
    .slice(0, 50);
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${baseName || "image"}-${timestamp}-${random}${ext}`;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    if (!BUCKET_NAME || !PUBLIC_DOMAIN) {
      return NextResponse.json(
        {
          success: false,
          error: "R2 環境變數未正確設定（R2_BUCKET_NAME, R2_PUBLIC_DOMAIN）",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "請選擇要上傳的檔案" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `不支援的檔案類型：${file.type}。僅支援 JPG, PNG, GIF, WebP, AVIF`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `檔案過大（最大 10MB）。目前：${(file.size / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    const uniqueFilename = generateUniqueFilename(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: uniqueFilename,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const publicUrl = `${PUBLIC_DOMAIN.replace(/\/$/, "")}/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
    });
  } catch (error) {
    console.error("R2 上傳錯誤:", error);

    const message =
      error instanceof Error ? error.message : "上傳失敗，請稍後再試";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
