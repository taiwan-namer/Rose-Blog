"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const STORAGE_KEY = "joyseed_hero_images";
const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
];

function getHeroImages(): string[] {
  if (typeof window === "undefined") return DEFAULT_IMAGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const urls = raw ? JSON.parse(raw) : [];
    return Array.isArray(urls) && urls.length > 0 ? urls : DEFAULT_IMAGES;
  } catch {
    return DEFAULT_IMAGES;
  }
}

export default function HeroCarousel() {
  const [images, setImages] = useState<string[]>(DEFAULT_IMAGES);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setImages(getHeroImages());
    const onStorage = () => setImages(getHeroImages());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative h-[50vh] min-h-[320px] w-full overflow-hidden md:h-[60vh]">
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`輪播圖 ${i + 1}`}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
            unoptimized={src.includes("r2.dev")}
          />
        </div>
      ))}

      {/* 圓點指示器 */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`前往第 ${i + 1} 張`}
            onClick={() => setCurrent(i)}
            className={`h-2 w-2 rounded-full transition-all ${
              i === current
                ? "w-6 bg-white"
                : "bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
