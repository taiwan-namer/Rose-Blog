import { Suspense } from "react";
import HeroCarousel from "@/components/home/HeroCarousel";
import FeaturedPosts from "@/components/home/FeaturedPosts";
import Sidebar from "@/components/home/Sidebar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-10 md:px-6">
        <div className="overflow-hidden rounded-xl">
          <HeroCarousel />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <main className="min-w-0 flex-1">
            <Suspense
              fallback={
                <div className="space-y-10">
                  <div className="h-48 animate-pulse rounded bg-gray-100" />
                </div>
              }
            >
              <FeaturedPosts />
            </Suspense>
          </main>
          <aside className="w-full shrink-0 lg:w-72">
            <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-gray-100" />}>
              <Sidebar />
            </Suspense>
          </aside>
        </div>
      </div>
    </div>
  );
}
