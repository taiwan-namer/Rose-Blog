'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, Sparkles, Stars, Moon, MapPin } from 'lucide-react';

// 時辰：子丑寅卯辰巳午未申酉戌亥，每時辰 2 小時
const SHICHEN = [
  { key: '子', range: '23:00 - 00:59' },
  { key: '丑', range: '01:00 - 02:59' },
  { key: '寅', range: '03:00 - 04:59' },
  { key: '卯', range: '05:00 - 06:59' },
  { key: '辰', range: '07:00 - 08:59' },
  { key: '巳', range: '09:00 - 10:59' },
  { key: '午', range: '11:00 - 12:59' },
  { key: '未', range: '13:00 - 14:59' },
  { key: '申', range: '15:00 - 16:59' },
  { key: '酉', range: '17:00 - 18:59' },
  { key: '戌', range: '19:00 - 20:59' },
  { key: '亥', range: '21:00 - 22:59' },
] as const;

function DestinyMapFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-purple-200/80">載入中...</div>
    </div>
  );
}

function DestinyMapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    birthPlace: '',
    birthDate: '',
    birthTime: '', // 時辰：子、丑、寅...
    isTimeUnknown: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const nameFromUrl = searchParams.get('name');
    if (nameFromUrl?.trim()) {
      setFormData((prev) => ({ ...prev, name: decodeURIComponent(nameFromUrl.trim()) }));
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '請輸入您的姓名';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = '請選擇出生日期';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = '無法讀取未出生者的未來';
      }
    }

    if (!formData.isTimeUnknown && !formData.birthTime) {
      newErrors.birthTime = '請選擇出生時辰，或勾選「不知道」';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Encode data for URL sharing（birthTime 為時辰：子、丑… 或空）
    const payload = {
      name: formData.name,
      birthPlace: formData.birthPlace.trim() || undefined,
      birthDate: formData.birthDate,
      birthTime: formData.isTimeUnknown ? '' : formData.birthTime,
      isTimeUnknown: formData.isTimeUnknown,
    };

    try {
      const jsonString = JSON.stringify(payload);
      const encodedData = btoa(encodeURIComponent(jsonString));
      router.push(`/destinymap/result?data=${encodedData}`);
    } catch (err) {
      console.error('編碼失敗:', err);
      alert('資料處理發生錯誤，請重試');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-12 space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-full">
                <Moon className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent leading-tight">
            DestinyMap
          </h1>

          <p className="text-xl md:text-2xl text-purple-200/80 font-light">
            紫微斗數 × 旅行命盤
          </p>

          <div className="max-w-2xl mx-auto leading-relaxed text-slate-300 animate-fade-in-up">
            <p className="text-base">
              透過古老的紫微斗數智慧，並運用最先進的
              <span className="text-white font-medium">生成式 AI</span>
              分析，找尋最符合您的旅程。
            </p>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-purple-200">
                <Sparkles className="w-4 h-4" />
                您的姓名
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="請輸入姓名"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
              {errors.name && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-purple-200">
                <Calendar className="w-4 h-4" />
                出生日期
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all [color-scheme:dark]"
              />
              {errors.birthDate && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.birthDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-purple-200">
                <MapPin className="w-4 h-4" />
                出生地
              </label>
              <input
                type="text"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                placeholder="例：台北、高雄（選填）"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-purple-200">
                <Clock className="w-4 h-4" />
                出生時辰
              </label>
              <div className="space-y-3">
                <select
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  disabled={formData.isTimeUnknown}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]"
                >
                  <option value="" className="bg-slate-800 text-slate-300">請選擇時辰</option>
                  {SHICHEN.map(({ key, range }) => (
                    <option key={key} value={key} className="bg-slate-800 text-slate-300">
                      {key}  {range}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.isTimeUnknown}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isTimeUnknown: e.target.checked,
                          birthTime: e.target.checked ? '' : formData.birthTime,
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 bg-white/5 border border-white/20 rounded-md peer-checked:bg-purple-500 peer-checked:border-purple-500 transition-all" />
                    <svg
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                    不知道確切時辰（將以午時推算）
                  </span>
                </label>
              </div>
              {errors.birthTime && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.birthTime}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="group relative w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity blur-xl" />
              <span className="relative flex items-center justify-center gap-2 text-lg">
                <Stars className="w-5 h-5 animate-pulse" />
                揭開我的命運之旅
                <Stars className="w-5 h-5 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              🔒 我們重視您的隱私。您的出生資料僅用於即時分析，不會儲存於任何資料庫。
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-2xl mb-2">✨</div>
            <div className="text-sm font-medium text-purple-200">AI 紫微分析</div>
            <div className="text-xs text-slate-400 mt-1">古老智慧 × 現代科技</div>
          </div>
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-2xl mb-2">🌍</div>
            <div className="text-sm font-medium text-purple-200">專屬旅行推薦</div>
            <div className="text-xs text-slate-400 mt-1">為您量身打造目的地</div>
          </div>
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-2xl mb-2">🔗</div>
            <div className="text-sm font-medium text-purple-200">一鍵分享</div>
            <div className="text-xs text-slate-400 mt-1">分享至 Facebook、IG、Threads</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            本網站包含聯盟行銷連結，點擊預訂可能為我們帶來收益
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DestinyMapPage() {
  return (
    <Suspense fallback={<DestinyMapFallback />}>
      <DestinyMapContent />
    </Suspense>
  );
}
