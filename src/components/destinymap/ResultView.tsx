'use client';

import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Star, TrendingUp, Share2, BedDouble, Ticket, Plane, Compass } from 'lucide-react';
import CityImage from './CityImage';

const MOCK_RESULT = {
  personality_summary: '您性格溫和謙遜，擁有堅韌的意志力，適合在旅途中尋找內心的平靜與力量',
  lucky_elements: ['水', '木'],
  lucky_direction: '東南方',
  fortune_score: 82,
  recommendations: [
    { city: '京都', country: '日本', reason: '古寺與禪意完美契合您的水元素，東方文化能滋養您的心靈', hotel_url: 'https://www.agoda.com/search?text=京都', activity_url: 'https://www.klook.com/activity/kyoto/', flight_url: 'https://www.trip.com/flights/search?keyword=京都' },
    { city: '峇里島', country: '印尼', reason: '熱帶雨林與海洋的木水相生，為您帶來身心靈的完美平衡', hotel_url: 'https://www.agoda.com/search?text=峇里島', activity_url: 'https://www.klook.com/activity/bali/', flight_url: 'https://www.trip.com/flights/search?keyword=峇里島' },
    { city: '清邁', country: '泰國', reason: '寧靜的山林與寺廟氛圍，能激發您內在的創造力與智慧', hotel_url: 'https://www.agoda.com/search?text=清邁', activity_url: 'https://www.klook.com/activity/chiang-mai/', flight_url: 'https://www.trip.com/flights/search?keyword=清邁' },
  ],
};

interface ResultViewProps {
  data?: typeof MOCK_RESULT;
  isLoading?: boolean;
  userData?: { name: string; birthDate: string };
}

export default function ResultView({
  data = MOCK_RESULT,
  isLoading = false,
  userData = { name: '訪客', birthDate: '1990-01-01' },
}: ResultViewProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    let index = 0;
    const text = data.personality_summary;
    setDisplayedText('');
    setIsTyping(true);

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [data.personality_summary, isLoading]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DestinyMap - 我的命運旅行地圖',
          text: `${userData.name} 的專屬旅行命盤已解析！`,
          url: window.location.href,
        });
      } catch {
        console.log('分享已取消');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('連結已複製到剪貼簿！');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
            <div className="absolute inset-4 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-purple-200">正在推算命盤...</p>
            <p className="text-slate-400">星辰正在為您指引方向</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-200">
            <Sparkles className="w-4 h-4" />
            {userData.name} 的命運之旅
          </div>

          <button
            onClick={handleShare}
            className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300 hover:bg-white/10 transition-all"
          >
            <Share2 className="w-4 h-4" />
            分享結果
          </button>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-200 mb-6 flex items-center gap-2">
            <Compass className="w-6 h-6" />
            命運儀表板
          </h2>

          <div className="mb-8 p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20">
            <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" />
              性格解析
            </h3>
            <p className="text-lg text-white leading-relaxed">
              {displayedText}
              {isTyping && <span className="inline-block w-0.5 h-5 bg-purple-400 ml-1 animate-pulse" />}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs text-slate-400 mb-2">幸運元素</div>
              <div className="flex gap-2">
                {data.lucky_elements.map((element) => (
                  <span key={element} className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-sm font-semibold text-white">
                    {element}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs text-slate-400 mb-2">吉利方位</div>
              <div className="text-2xl font-bold text-purple-200">{data.lucky_direction}</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs text-slate-400 mb-2">運勢指數</div>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - data.fortune_score / 100)}`} className="text-purple-400 transition-all duration-1000" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                    {data.fortune_score}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">運勢旺盛</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-purple-200 flex items-center gap-2 mb-6">
            <MapPin className="w-6 h-6" />
            命運旅行指南
          </h2>

          {data.recommendations.map((dest, index) => (
            <div key={index} className="group backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                  <CityImage city={dest.city} />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-purple-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white z-10 shadow-lg">
                    推薦 #{index + 1}
                  </div>
                </div>
                <div className="md:w-2/3 p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{dest.city}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {dest.country}
                    </p>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{dest.reason}</p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <a href={dest.hotel_url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all">
                      <BedDouble className="w-4 h-4" />
                      <span>找住宿</span>
                    </a>
                    <a href={dest.activity_url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all">
                      <Ticket className="w-4 h-4" />
                      <span>訂行程</span>
                    </a>
                    <a href={dest.flight_url || '#'} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all group/flight">
                      <Plane className="w-4 h-4 group-hover/flight:text-blue-400 transition-colors" />
                      <span>查詢飛往 {dest.city} 的機票</span>
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-slate-500 rounded-full" />
                    此為聯盟連結，點擊預訂可能為我們帶來收益
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center space-y-4">
          <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20 p-6">
            <p className="text-lg text-purple-200 mb-4">
              ✨ 覺得準確嗎？分享給朋友一起探索命運旅程！
            </p>
            <button onClick={handleShare} className="px-8 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all">
              <Share2 className="inline w-4 h-4 mr-2" />
              分享我的結果
            </button>
          </div>

          <a href="/destinymap" className="inline-block text-slate-400 hover:text-purple-300 transition-colors">
            ← 返回首頁重新測算
          </a>
        </div>
      </div>
    </div>
  );
}
