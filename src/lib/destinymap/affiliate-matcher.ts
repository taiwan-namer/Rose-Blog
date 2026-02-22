import { DeepSeekRecommendationItem } from "@/types/destinymap";

const AGODA_CID = process.env.NEXT_PUBLIC_AGODA_CID || '1899732';
const TRIP_ID = process.env.NEXT_PUBLIC_TRIP_ID || '325785';

const TRIP_FLIGHT: Record<string, { slug: string; iata: string }> = {
  "東京": { slug: "tokyo", iata: "tyo" }, "大阪": { slug: "osaka", iata: "osa" }, "京都": { slug: "kyoto", iata: "kix" },
  "北海道": { slug: "sapporo", iata: "spk" }, "札幌": { slug: "sapporo", iata: "spk" }, "沖繩": { slug: "okinawa", iata: "oka" },
  "福岡": { slug: "fukuoka", iata: "fuk" }, "名古屋": { slug: "nagoya", iata: "ngo" },
  "奈良": { slug: "nara", iata: "osa" }, "神戶": { slug: "kobe", iata: "ukb" }, "箱根": { slug: "hakone", iata: "tyo" },
  "廣島": { slug: "hiroshima", iata: "hij" }, "金澤": { slug: "kanazawa", iata: "kmq" },
  "首爾": { slug: "seoul", iata: "sel" }, "釜山": { slug: "busan", iata: "pus" }, "濟州": { slug: "jeju", iata: "cju" },
  "仁川": { slug: "incheon", iata: "icn" }, "大邱": { slug: "daegu", iata: "tau" }, "慶州": { slug: "gyeongju", iata: "pus" },
  "北京": { slug: "beijing", iata: "bjs" }, "上海": { slug: "shanghai", iata: "sha" }, "成都": { slug: "chengdu", iata: "ctu" },
  "杭州": { slug: "hangzhou", iata: "hgh" }, "西安": { slug: "xian", iata: "xiy" }, "重慶": { slug: "chongqing", iata: "ckg" }, "青島": { slug: "qingdao", iata: "tao" },
  "廣州": { slug: "guangzhou", iata: "can" }, "深圳": { slug: "shenzhen", iata: "szx" }, "三亞": { slug: "sanya", iata: "syx" },
  "麗江": { slug: "lijiang", iata: "ljg" }, "桂林": { slug: "guilin", iata: "kwl" }, "廈門": { slug: "xiamen", iata: "xmn" },
  "香港": { slug: "hong-kong", iata: "hkg" }, "澳門": { slug: "macau", iata: "mfm" }, "台北": { slug: "taipei", iata: "tpe" }, "高雄": { slug: "kaohsiung", iata: "khh" },
  "曼谷": { slug: "bangkok", iata: "bkk" }, "清邁": { slug: "chiang-mai", iata: "cnx" },
  "普吉島": { slug: "phuket", iata: "hkt" }, "芭達雅": { slug: "pattaya", iata: "utp" }, "甲米": { slug: "krabi", iata: "kbv" }, "蘇梅島": { slug: "koh-samui", iata: "usm" },
  "河內": { slug: "hanoi", iata: "han" }, "峴港": { slug: "da-nang", iata: "dad" }, "胡志明市": { slug: "ho-chi-minh-city", iata: "sgn" },
  "會安": { slug: "hoi-an", iata: "dad" }, "芽莊": { slug: "nha-trang", iata: "cxr" }, "下龍灣": { slug: "ha-long-bay", iata: "hph" },
  "吉隆坡": { slug: "kuala-lumpur", iata: "kul" }, "檳城": { slug: "penang", iata: "pen" }, "馬六甲": { slug: "malacca", iata: "kul" }, "亞庇": { slug: "kota-kinabalu", iata: "bki" },
  "新加坡": { slug: "singapore", iata: "sin" },
  "馬尼拉": { slug: "manila", iata: "mnl" }, "宿霧": { slug: "cebu", iata: "ceb" }, "長灘島": { slug: "boracay", iata: "mph" },
  "倫敦": { slug: "london", iata: "lon" }, "愛丁堡": { slug: "edinburgh", iata: "edi" }, "曼徹斯特": { slug: "manchester", iata: "man" },
  "巴黎": { slug: "paris", iata: "par" }, "尼斯": { slug: "nice", iata: "nce" }, "里昂": { slug: "lyon", iata: "lys" },
  "羅馬": { slug: "rome", iata: "rom" }, "威尼斯": { slug: "venice", iata: "vce" }, "佛羅倫斯": { slug: "florence", iata: "flr" }, "米蘭": { slug: "milan", iata: "mil" },
  "蘇黎世": { slug: "zurich", iata: "zrh" }, "琉森": { slug: "lucerne", iata: "zrh" }, "日內瓦": { slug: "geneva", iata: "gva" }, "因特拉肯": { slug: "interlaken", iata: "brn" },
  "柏林": { slug: "berlin", iata: "ber" }, "慕尼黑": { slug: "munich", iata: "muc" }, "法蘭克福": { slug: "frankfurt", iata: "fra" },
  "巴塞隆納": { slug: "barcelona", iata: "bcn" }, "馬德里": { slug: "madrid", iata: "mad" },
  "阿姆斯特丹": { slug: "amsterdam", iata: "ams" }, "維也納": { slug: "vienna", iata: "vie" },
  "紐約": { slug: "new-york", iata: "nyc" }, "洛杉磯": { slug: "los-angeles", iata: "lax" }, "舊金山": { slug: "san-francisco", iata: "sfo" },
  "拉斯維加斯": { slug: "las-vegas", iata: "las" }, "西雅圖": { slug: "seattle", iata: "sea" }, "芝加哥": { slug: "chicago", iata: "chi" },
  "奧蘭多": { slug: "orlando", iata: "mco" }, "檀香山": { slug: "honolulu", iata: "hnl" }, "波士頓": { slug: "boston", iata: "bos" },
  "溫哥華": { slug: "vancouver", iata: "yvr" }, "多倫多": { slug: "toronto", iata: "yto" },
  "雪梨": { slug: "sydney", iata: "syd" }, "墨爾本": { slug: "melbourne", iata: "mel" }, "黃金海岸": { slug: "gold-coast", iata: "ool" }, "布里斯本": { slug: "brisbane", iata: "bne" },
};

function toEnglishSearchName(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export interface EnrichedRecommendation extends DeepSeekRecommendationItem {
  hotel_url: string;
  booking_url: string;
  flight_url: string;
}

function getDefaultCheckInOut(): { checkIn: string; checkOut: string } {
  const from = new Date();
  const checkIn = new Date(from);
  checkIn.setDate(checkIn.getDate() + 30);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 3);
  return {
    checkIn: checkIn.toISOString().slice(0, 10),
    checkOut: checkOut.toISOString().slice(0, 10),
  };
}

export function getAffiliateLinks(recommendations: DeepSeekRecommendationItem[]): EnrichedRecommendation[] {
  const { checkIn, checkOut } = getDefaultCheckInOut();

  return recommendations.map((dest) => {
    const cleanCity = dest.city.trim();
    const cityName = cleanCity.includes('/') ? cleanCity.split('/')[1].trim() : cleanCity;
    const tripInfoForSearch = TRIP_FLIGHT[cleanCity.includes('/') ? cleanCity.split('/')[0] : cleanCity] || TRIP_FLIGHT[cleanCity];

    const hotelUrl = `https://www.agoda.com/zh-tw/search?cid=${AGODA_CID}&query=${encodeURIComponent(cityName)}&placeId=1&checkIn=2026-06-01&checkOut=2026-06-02&rooms=1&adults=2`;

    const cityForSearch = cleanCity.includes('/') ? cleanCity.split('/')[0] : cleanCity;
    const bookingCity = tripInfoForSearch ? toEnglishSearchName(tripInfoForSearch.slug) : cityForSearch;
    const bookingUrl = `https://www.booking.com/searchresults.zh-tw.html?ss=${encodeURIComponent(bookingCity)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=2&no_rooms=1&group_children=0`;

    const iataUpper = tripInfoForSearch ? tripInfoForSearch.iata.toUpperCase() : '';
    const flightUrl = tripInfoForSearch
      ? `https://tw.trip.com/flights/showfarefirst?dcity=TPE&acity=${iataUpper}&ddate=${checkIn}&rdate=${checkOut}&triptype=rt&class=y&lowpricesource=searchform&quantity=1&searchboxarg=t&nonstoponly=off&locale=zh-TW&curr=TWD&AllianceID=${TRIP_ID}&sid=destinymap`
      : `https://tw.trip.com/flights/?AllianceID=${TRIP_ID}&sid=destinymap&locale=zh-TW&curr=TWD`;

    return {
      ...dest,
      hotel_url: hotelUrl,
      booking_url: bookingUrl,
      flight_url: flightUrl,
    };
  });
}
