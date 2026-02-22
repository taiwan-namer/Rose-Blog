'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { ArrowLeft, MapPin, Star, Compass, TrendingUp, Heart, Wallet, Bug, Coffee, Share2 } from 'lucide-react';
import { analyzeDestiny } from '@/actions/destinymap/analyze';
import CityImage from '@/components/destinymap/CityImage';
import { getAffiliateLinks } from '@/lib/destinymap/affiliate-matcher';

interface Recommendation {
  type: string;
  city: string;
  country: string;
  reason: string;
  coordinates?: { lat: number; lng: number };
}

interface DestinyResult {
  personality_summary: string;
  year_fortune?: string;
  love?: string;
  career?: string;
  wealth?: string;
  lucky_elements: string[];
  lucky_colors?: string[];
  lucky_directions: string[];
  destiny_score: number;
  score_trend: string;
  recommendations: Recommendation[];
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<DestinyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugData, setDebugData] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copyHint, setCopyHint] = useState('');

  useEffect(() => {
    const data = searchParams.get('data');
    setDebugData(data || '(空)');

    if (!data) {
      setError('網址中找不到 data 參數');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        let decodedData: { name?: string } | null = null;

        const strategies = [
          () => JSON.parse(data),
          () => JSON.parse(atob(data)),
          () => JSON.parse(decodeURIComponent(data)),
          () => JSON.parse(decodeURIComponent(atob(data))),
          () => JSON.parse(atob(decodeURIComponent(data)))
        ];

        for (const strategy of strategies) {
          try {
            decodedData = strategy();
            if (decodedData && decodedData.name) break;
          } catch {
            continue;
          }
        }

        if (!decodedData) {
          throw new Error("無法辨識資料格式");
        }

        const CACHE_KEY = "destinymap_result_";
        try {
          const cached = typeof window !== "undefined" ? window.sessionStorage.getItem(CACHE_KEY + data) : null;
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && Array.isArray(parsed.recommendations) && parsed.recommendations.length === 3) {
              setResult(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {
          // ignore
        }

        const res = await analyzeDestiny(decodedData);
        setResult(res);
        try {
          if (typeof window !== "undefined" && res) {
            window.sessionStorage.setItem(CACHE_KEY + data, JSON.stringify(res));
          }
        } catch {
          // ignore
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '算算發生錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') setShareUrl(window.location.href);
  }, [result]);

  const handleCopyForIG = () => {
    if (typeof window === 'undefined') return;
    window.navigator.clipboard.writeText(shareUrl);
    setCopyHint('連結已複製！可至 IG 貼上分享');
    setTimeout(() => setCopyHint(''), 2000);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Bug className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl mb-2 text-red-400 font-bold">資料解析失敗</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <div className="w-full max-w-lg bg-slate-950 p-4 rounded-xl border border-red-500/30 mb-8 overflow-hidden">
          <p className="text-xs text-slate-500 mb-2 font-mono">DEBUG INFO:</p>
          <code className="text-xs text-yellow-300 break-all font-mono block max-h-40 overflow-y-auto">
            {debugData}
          </code>
        </div>
        <button onClick={() => router.push('/destinymap')} className="px-8 py-3 bg-purple-600 rounded-full hover:bg-purple-700 transition font-bold">
          返回首頁重試
        </button>
      </div>
    );
  }

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse text-purple-300">正在連結星象數據 (2026)...</p>
      </div>
    );
  }

  const getTypeConfig = (type: string) => {
    if (type?.includes('財')) return { color: 'bg-yellow-500', icon: <Wallet className="w-4 h-4 mr-1" />, label: '財庫旺運' };
    if (type?.includes('情') || type?.includes('桃')) return { color: 'bg-pink-500', icon: <Heart className="w-4 h-4 mr-1" />, label: '感情桃花' };
    if (type?.includes('身') || type?.includes('心') || type?.includes('靈') || type?.includes('福') || type?.includes('樂')) {
      return { color: 'bg-emerald-500', icon: <Coffee className="w-4 h-4 mr-1" />, label: '身心療癒' };
    }
    return { color: 'bg-purple-500', icon: <Star className="w-4 h-4 mr-1" />, label: '流年改運' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center space-x-4 mb-8">
        <button onClick={() => router.push('/destinymap')} className="p-2 hover:bg-slate-800 rounded-full transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          2026 命運旅行指南
        </h1>
      </header>

      <section className="bg-slate-800/50 rounded-2xl p-5 md:p-6 backdrop-blur-sm border border-slate-700">
        <div className="flex items-center space-x-2 mb-4">
          <Compass className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold">命運儀表板</h2>
        </div>
        <div className="grid md:grid-cols-[1fr,auto] gap-4 md:gap-5 items-start">
          <div>
            <h3 className="text-xs text-slate-400 mb-3 flex items-center">
              <Star className="w-3.5 h-3.5 mr-1.5 text-yellow-400" /> 性格解析
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm leading-snug">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 min-w-0">
                <div className="font-semibold text-purple-300 text-xs mb-1">今年運勢</div>
                <p className="text-slate-200 text-xs">{result.year_fortune ?? result.personality_summary}</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 min-w-0">
                <div className="font-semibold text-pink-300 text-xs mb-1">感情</div>
                <p className="text-slate-200 text-xs">{result.love ?? "—"}</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 min-w-0">
                <div className="font-semibold text-blue-300 text-xs mb-1">流年改運</div>
                <p className="text-slate-200 text-xs">{result.career ?? "—"}</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 min-w-0">
                <div className="font-semibold text-amber-300 text-xs mb-1">財庫</div>
                <p className="text-slate-200 text-xs">{result.wealth ?? "—"}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 w-full md:w-44 shrink-0">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <h3 className="text-xs text-slate-400 mb-1">2026 運勢指數</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{result.destiny_score}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className="flex items-center mt-1.5 text-xs text-green-400">
                <TrendingUp className="w-3 h-3 mr-1 shrink-0" />
                <span className="truncate">{result.score_trend}</span>
              </div>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <h3 className="text-xs text-slate-400 mb-1.5">吉利方位</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.lucky_directions?.map((dir, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded">{dir}</span>
                ))}
              </div>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 col-span-2 md:col-span-1">
              <h3 className="text-xs text-slate-400 mb-1.5">幸運元素</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.lucky_elements?.map((el, i) => (
                  <span key={i} className="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                    {el}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center text-slate-200">
          <MapPin className="w-5 h-5 mr-2 text-purple-400" />
          2026 開運目的地
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {getAffiliateLinks(result.recommendations).map((place, idx) => {
            const config = getTypeConfig(place.type || '');
            const cityDisplay = place.city.includes("/") ? place.city.split("/")[1] : place.city;
            const reasonDisplay = (place.reason || "").replace(/\//g, "");
            return (
              <div key={idx} className="group bg-slate-800 rounded-2xl overflow-hidden hover:ring-2 hover:ring-purple-500/50 transition duration-300 border border-slate-700 flex flex-col">
                <div className="h-48 relative overflow-hidden">
                  <CityImage city={place.city} />
                  <div className={`absolute top-3 right-3 ${config.color} text-white text-xs px-3 py-1 rounded-full shadow-lg flex items-center font-bold z-10`}>{config.icon}{config.label}</div>
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-slate-900 to-transparent">
                    <h3 className="text-2xl font-bold text-white">{cityDisplay}</h3>
                    <div className="flex items-center text-slate-300 text-sm"><MapPin className="w-3 h-3 mr-1" />{place.country}</div>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-grow">{reasonDisplay}</p>
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <a href={place.hotel_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-2.5 bg-[#FF2938] hover:bg-[#e01e2e] text-white rounded-xl text-sm font-medium transition">Agoda</a>
                    <a href={place.booking_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-2.5 bg-[#003580] hover:bg-[#00224e] text-white rounded-xl text-sm font-medium transition">Booking</a>
                  </div>
                  <a href={place.flight_url} target="_blank" rel="noopener noreferrer" className="mt-3 w-full py-2 border border-slate-600 hover:bg-slate-700 text-slate-300 rounded-xl text-xs text-center transition flex items-center justify-center">✈️ 查往 {cityDisplay} 機票 Trip.com</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 p-5 rounded-2xl bg-slate-800/50 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-purple-400" />
          一鍵分享
        </h3>
        <div className="flex flex-wrap gap-3">
          <a
            href={shareUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-sm font-medium transition"
          >
            Facebook
          </a>
          <button
            type="button"
            onClick={handleCopyForIG}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] to-[#cc2366] hover:opacity-90 text-white rounded-xl text-sm font-medium transition"
          >
            IG
          </button>
          <a
            href={shareUrl ? `https://www.threads.net/intent/post?text=${encodeURIComponent('我的 2026 命運旅行指南 ' + shareUrl)}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-600 rounded-xl text-sm font-medium transition"
          >
            Threads
          </a>
        </div>
        {copyHint && <p className="mt-2 text-xs text-green-400">{copyHint}</p>}
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <Suspense fallback={<div className="text-white text-center mt-20">載入中...</div>}>
        <ResultContent />
      </Suspense>
    </main>
  );
}
