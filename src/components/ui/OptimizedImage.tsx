import Image, { ImageProps } from "next/image";

export interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  /** 圖片 URL（完整 URL 或 R2 儲存的路徑） */
  src: string;
  /** 優先載入（用於 LCP 圖片） */
  priority?: boolean;
}

const DEFAULT_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px";
const DEFAULT_QUALITY = 80;

/**
 * 封裝 next/image，串接 R2 域名並預設縮放與優化設定
 * 確保 R2_PUBLIC_DOMAIN 對應的 hostname 已加入 next.config 的 images.remotePatterns
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes = DEFAULT_SIZES,
  quality = DEFAULT_QUALITY,
  priority = false,
  className,
  ...rest
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      quality={quality}
      priority={priority}
      className={className}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEEA/ALWn6PZW9pFFHbxqiqFUKoAAA6AFFN1LJ8j/2Q=="
      {...rest}
    />
  );
}
