"use client";

import Link from "next/link";
import { useState } from "react";

// 導航選單結構（連結至首頁依標籤篩選）
const navItems = [
  {
    label: "國內旅遊",
    href: "/",
    children: [
      { label: "宜蘭", href: "/?tag=yilan" },
      { label: "台北", href: "/?tag=taipei" },
      { label: "桃園", href: "/?tag=taoyuan" },
      { label: "新北", href: "/?tag=new-taipei" },
      { label: "台中", href: "/?tag=taichung" },
    ],
  },
  {
    label: "國外旅遊",
    href: "/",
    children: [
      { label: "日本", href: "/?tag=japan" },
      { label: "韓國", href: "/?tag=korea" },
      { label: "泰國", href: "/?tag=thailand" },
    ],
  },
  {
    label: "親子生活",
    href: "/",
      children: [
      { label: "親子景點", href: "/?tag=attractions" },
      { label: "親子餐廳", href: "/?tag=restaurants" },
      { label: "親子活動", href: "/?tag=activities" },
    ],
  },
  {
    label: "親子課程",
    href: "/",
    children: [
      { label: "雙北", href: "/?tag=parenting-course-north" },
      { label: "桃竹苗", href: "/?tag=parenting-course-taoyuan" },
      { label: "中部", href: "/?tag=parenting-course-central" },
      { label: "南部", href: "/?tag=parenting-course-south" },
    ],
  },
  {
    label: "Rose 的小衣櫃",
    href: "/",
    children: [
      { label: "NM", href: "/?tag=rose-closet-nm" },
      { label: "LL", href: "/?tag=rose-closet-ll" },
      { label: "WDW", href: "/?tag=rose-closet-wdw" },
      { label: "ER", href: "/?tag=rose-closet-er" },
      { label: "財財的手作基地", href: "/?tag=rose-closet-tsai" },
      { label: "小星星", href: "/?tag=rose-closet-star" },
    ],
  },
];

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sky-blue/30 bg-gradient-to-r from-sky-blue/90 via-sky-blue/80 to-sky-blue/70 backdrop-blur supports-[backdrop-filter]:bg-sky-blue/95">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        {/* 品牌名稱 */}
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-wide text-white hover:text-white/90 sm:text-2xl"
        >
          Rose Blog
        </Link>

        {/* 主選單 */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className="flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                {item.label}
                <svg
                  className={`h-4 w-4 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>

              {/* 下拉選單 */}
              {openDropdown === item.label && item.children && (
                <div className="absolute left-0 top-full pt-1">
                  <div className="min-w-[160px] rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-blue/20 hover:text-sky-blue-dark"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* 行動版選單按鈕 */}
          <button
            type="button"
            aria-label="開啟選單"
            className="rounded-md p-2 text-white hover:bg-white/20 md:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
