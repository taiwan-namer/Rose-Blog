# 親子旅遊部落格 - 專案目錄結構

仿照 yuki.tw (Yuki's Life) 的親子旅遊部落格結構。

## 技術棧

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **TypeScript**

## 目錄結構

```
src/
├── app/                      # App Router 頁面
│   ├── layout.tsx            # 全域佈局（含 Sticky 導航欄）
│   ├── page.tsx              # 首頁
│   ├── globals.css           # 全域樣式
│   ├── travel/               # 旅遊分類路由
│   │   ├── domestic/         # 國內旅遊
│   │   │   └── [region]/     # 宜蘭、台北、桃園等
│   │   └── overseas/         # 國外旅遊
│   │       └── [country]/    # 日本、韓國、泰國等
│   ├── family/               # 親子生活
│   │   └── [category]/       # 親子景點、美食、活動
│   └── post/                 # 單篇文章
│       └── [slug]/           # 動態文章路由
│
├── components/
│   ├── layout/               # 佈局元件
│   │   ├── Navbar.tsx        # 頂部導航（Sticky、下拉選單、搜尋）
│   │   └── Sidebar.tsx       # 側邊欄（待建立）
│   ├── home/                 # 首頁模組（待建立）
│   │   ├── Carousel.tsx      # 精選文章輪播
│   │   └── CategoryGrid.tsx  # 分類快報區
│   ├── post/                 # 文章相關元件（待建立）
│   │   ├── PostCard.tsx      # 文章卡片
│   │   ├── Breadcrumbs.tsx   # 麵包屑
│   │   └── RelatedPosts.tsx  # 相關文章
│   └── ui/                   # 通用 UI 元件（待建立）
│       └── Pagination.tsx    # 分頁導航
│
├── lib/                      # 工具函式（待建立）
│   └── utils.ts
│
└── types/                    # TypeScript 型別（待建立）
    └── post.ts
```

## 已完成

- [x] Next.js 14 專案初始化
- [x] Tailwind CSS 設定
- [x] 全域 layout.tsx（含 SEO Metadata）
- [x] Sticky 頂部導航欄
- [x] Logo、多級下拉選單（國內旅遊、國外旅遊、親子生活）
- [x] 搜尋圖示
- [x] 使用 Noto Sans TC 中文字型
- [x] OpenGraph 基礎設定

## 待建立

- [ ] 首頁大型輪播 (Carousel)
- [ ] 分類快報區 (CategoryGrid)
- [ ] 側邊欄（作者介紹、熱門文章、社群連結、FB 粉絲團）
- [ ] 文章列表頁 + 分頁
- [ ] 單篇文章頁（麵包屑、Markdown 渲染、相關文章）
- [ ] 搜尋功能
- [ ] 行動版選單
