'use client';

import { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

const CITY_MAPPING: Record<string, string> = {
  "東京": "Tokyo", "大阪": "Osaka", "京都": "Kyoto", "北海道": "Hokkaido", "札幌": "Sapporo", "沖繩": "Okinawa",
  "福岡": "Fukuoka", "名古屋": "Nagoya", "奈良": "Nara Japan", "神戶": "Kobe", "箱根": "Hakone", "廣島": "Hiroshima", "金澤": "Kanazawa",
  "首爾": "Seoul", "釜山": "Busan", "濟州": "Jeju", "仁川": "Incheon", "大邱": "Daegu", "慶州": "Gyeongju",
  "北京": "Beijing", "上海": "Shanghai", "成都": "Chengdu", "杭州": "Hangzhou", "西安": "Xi'an", "重慶": "Chongqing", "青島": "Qingdao",
  "廣州": "Guangzhou", "深圳": "Shenzhen", "三亞": "Sanya", "麗江": "Lijiang", "桂林": "Guilin", "廈門": "Xiamen",
  "香港": "Hong Kong", "香港/銅鑼灣": "Causeway Bay Hong Kong", "香港/尖沙咀": "Tsim Sha Tsui Hong Kong", "香港/中環": "Central Hong Kong",
  "澳門": "Macau", "台北": "Taipei", "高雄": "Kaohsiung", "銅鑼灣": "Causeway Bay Hong Kong", "濱海灣區": "Marina Bay Singapore",
  "曼谷": "Bangkok", "清邁": "Chiang Mai", "普吉島": "Phuket", "芭達雅": "Pattaya", "甲米": "Krabi", "蘇梅島": "Ko Samui",
  "河內": "Hanoi", "峴港": "Da Nang", "胡志明市": "Ho Chi Minh City", "會安": "Hoi An", "芽莊": "Nha Trang", "下龍灣": "Ha Long Bay",
  "吉隆坡": "Kuala Lumpur", "檳城": "George Town Penang", "馬六甲": "Malacca", "亞庇": "Kota Kinabalu",
  "新加坡": "Singapore", "新加坡/濱海灣區": "Marina Bay Singapore", "新加坡/牛車水": "Chinatown Singapore", "新加坡/聖淘沙": "Sentosa Singapore",
  "馬尼拉": "Manila", "宿霧": "Cebu City", "長灘島": "Boracay",
  "倫敦": "London", "愛丁堡": "Edinburgh", "曼徹斯特": "Manchester",
  "巴黎": "Paris", "尼斯": "Nice France", "里昂": "Lyon", "羅馬": "Rome", "威尼斯": "Venice", "佛羅倫斯": "Florence", "米蘭": "Milan",
  "蘇黎世": "Zurich", "琉森": "Lucerne", "日內瓦": "Geneva", "因特拉肯": "Interlaken",
  "柏林": "Berlin", "慕尼黑": "Munich", "法蘭克福": "Frankfurt",
  "巴塞隆納": "Barcelona", "馬德里": "Madrid", "阿姆斯特丹": "Amsterdam", "維也納": "Vienna",
  "紐約": "New York City", "洛杉磯": "Los Angeles", "舊金山": "San Francisco",
  "拉斯維加斯": "Las Vegas", "西雅圖": "Seattle", "芝加哥": "Chicago", "奧蘭多": "Orlando", "檀香山": "Honolulu", "波士頓": "Boston",
  "溫哥華": "Vancouver", "多倫多": "Toronto", "雪梨": "Sydney", "墨爾本": "Melbourne", "黃金海岸": "Gold Coast Queensland", "布里斯本": "Brisbane",
};

const CUSTOM_IMAGES: Record<string, string> = {
  "北海道": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1000&auto=format&fit=crop",
  "沖繩": "https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=1000&auto=format&fit=crop",
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1449824913929-4bdd42b00ade?q=80&w=1000&auto=format&fit=crop"
];

export default function CityImage({ city }: { city: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      try {
        setLoading(true);

        const customUrl = CUSTOM_IMAGES[city];
        if (customUrl) {
          if (isMounted) {
            setImageUrl(customUrl);
            setLoading(false);
          }
          return;
        }

        const wikiTitle = CITY_MAPPING[city] || city;
        const endpoint = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=1000&origin=*`;

        const res = await fetch(endpoint);
        const data = await res.json();
        const pages = data.query?.pages;

        if (pages) {
          const page = Object.values(pages)[0] as { thumbnail?: { source?: string } } | undefined;
          if (page?.thumbnail?.source && isMounted) {
            setImageUrl(page.thumbnail.source);
            setLoading(false);
            return;
          }
        }

        const zhEndpoint = `https://zh.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(city)}&prop=pageimages&format=json&pithumbsize=1000&origin=*`;
        const zhRes = await fetch(zhEndpoint);
        const zhData = await zhRes.json();
        const zhPages = zhData.query?.pages;

        if (zhPages) {
          const page = Object.values(zhPages)[0] as { thumbnail?: { source?: string } } | undefined;
          if (page?.thumbnail?.source && isMounted) {
            setImageUrl(page.thumbnail.source);
            setLoading(false);
            return;
          }
        }

        if (isMounted) {
          const randomFallback = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
          setImageUrl(randomFallback);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          const randomFallback = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
          setImageUrl(randomFallback);
          setLoading(false);
        }
      }
    };

    if (city) fetchImage();

    return () => { isMounted = false; };
  }, [city]);

  return (
    <div className="w-full h-full bg-slate-800 relative overflow-hidden group">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      )}

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={city}
          className={`w-full h-full object-cover transition-all duration-1000 ${
            loading ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
          } group-hover:scale-110`}
          onLoad={() => setLoading(false)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGES[0];
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <ImageOff className="w-8 h-8 opacity-50" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
    </div>
  );
}
