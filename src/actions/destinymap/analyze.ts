'use server';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 小時
interface CachedResult {
  data: Record<string, unknown>;
  expires: number;
}
interface DestinyFormData {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  gender?: string;
}
const resultCache = new Map<string, CachedResult>();

const SHICHEN_RANGE: Record<string, string> = {
  '子': '23:00-00:59', '丑': '01:00-02:59', '寅': '03:00-04:59', '卯': '05:00-06:59',
  '辰': '07:00-08:59', '巳': '09:00-10:59', '午': '11:00-12:59', '未': '13:00-14:59',
  '申': '15:00-16:59', '酉': '17:00-18:59', '戌': '19:00-20:59', '亥': '21:00-22:59',
};

function getCacheKey(formData: DestinyFormData): string {
  const name = String(formData.name ?? "").trim();
  const birthDate = String(formData.birthDate ?? "").trim();
  const birthTime = String(formData.birthTime ?? "").trim();
  const birthPlace = String(formData.birthPlace ?? "").trim();
  return `${name}|${birthDate}|${birthTime}|${birthPlace}`;
}

export async function analyzeDestiny(formData: DestinyFormData) {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!DEEPSEEK_API_KEY) {
    throw new Error("❌ 設定錯誤：請在 .env.local 設定 DEEPSEEK_API_KEY");
  }

  const cacheKey = getCacheKey(formData);
  const cached = resultCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const systemPrompt = `
    你是一位精通「紫微斗數」與「地理風水」的命理大師。
    請根據使用者的生辰，推算其 **2026年 (丙午年)** 的流年運勢。

    【任務目標】：
    1. 分析 2026 流年命宮、財帛宮、官祿宮、夫妻宮。
    2. 推薦 3 個旅遊地點，分別對應「身心靈」、「流年改運」、「感情」。（第二項為流年改運，reason 的「利於」請寫改運、轉運、開運、化解煞氣、提升整體流年等，勿寫事業人脈。）
    3. **評語格式要求**：必須依照「[主星]為命宮/流年主星，[城市]屬[方位/五行]，與[星曜]相生/相剋，利於[具體好處]」的句型撰寫。

    【選配地點限定】：recommendations 的 city/country **只能**從以下地區挑選，不得推薦其他地區。**重要：城市請多樣化**，依命盤選擇合適城市，勿每次都推薦相同組合。
    允許國家：日本、韓國、中國、香港、澳門、泰國、越南、馬來西亞、新加坡、菲律賓、英國、法國、義大利、瑞士、德國、西班牙、荷蘭、奧地利、美國、加拿大、澳洲。
    允許城市（從中輪替選用）：
    日本：東京、大阪、京都、北海道、札幌、沖繩、福岡、名古屋、奈良、神戶、箱根、廣島、金澤；
    韓國：首爾、釜山、濟州、仁川、大邱、慶州；
    中國：北京、上海、成都、杭州、西安、重慶、青島、廣州、深圳、三亞、麗江、桂林、廈門；
    香港：香港、香港/銅鑼灣、香港/尖沙咀、香港/中環；澳門：澳門；
    泰國：曼谷、清邁、普吉島、芭達雅、甲米、蘇梅島；
    越南：河內、峴港、胡志明市、會安、芽莊、下龍灣；
    馬來西亞：吉隆坡、檳城、馬六甲、亞庇；
    新加坡：新加坡、新加坡/濱海灣區、新加坡/牛車水、新加坡/聖淘沙；
    菲律賓：馬尼拉、宿霧、長灘島；
    英國：倫敦、愛丁堡、曼徹斯特；法國：巴黎、尼斯、里昂；義大利：羅馬、威尼斯、佛羅倫斯、米蘭；
    瑞士：蘇黎世、琉森、日內瓦、因特拉肯；德國：柏林、慕尼黑、法蘭克福；
    西班牙：巴塞隆納、馬德里；荷蘭：阿姆斯特丹；奧地利：維也納；
    美國：紐約、洛杉磯、舊金山、拉斯維加斯、西雅圖、芝加哥、奧蘭多、檀香山、波士頓；
    加拿大：溫哥華、多倫多；澳洲：雪梨、墨爾本、黃金海岸、布里斯本。
    **香港、新加坡**：若推薦香港則 city 必填「香港/銅鑼灣」或「香港/尖沙咀」等；若推薦新加坡則 city 必填「新加坡/濱海灣區」或「新加坡/牛車水」等。

    【絕對規則】：
    1. 僅回傳純 JSON 格式，不要有 markdown 或 think 標籤。
    2. JSON 必須包含 "lucky_directions" (陣列) 和 "destiny_score" (數字)，否則前端會壞掉。
    3. 性格解析請分四段輸出，對應欄位：year_fortune(今年運勢)、love(感情)、career(流年改運)、wealth(財庫)，每段約 1～2 句話；career 欄位請寫流年改運、開運方向等，不必寫事業工作。
    4. **性格解析語氣**：personality_summary、year_fortune、love、career、wealth 請用「白話、口語」撰寫，像朋友聊天一樣好懂，避免文言或過度術語；可以保留一點神祕感，但不要艱深。
    
    JSON 結構範例 (請嚴格遵守此欄位名稱)：
    {
      "personality_summary": "(白話總述，例如：你今年整體氣場不錯，適合往外走走)",
      "year_fortune": "(白話，例如：今年運勢平穩，下半年有貴人)",
      "love": "(白話，例如：感情上單身有機會遇桃花，有伴的適合一起出遊)",
      "career": "(白話，例如：流年宜往東方走動改運，或某地氣場利開運)",
      "wealth": "(白話，例如：理財保守為宜，出國花費量力而為)",
      "lucky_elements": ["金", "土"],
      "lucky_colors": ["白色", "黃色"],
      "lucky_directions": ["西方", "西南方"], 
      "destiny_score": 92,
      "score_trend": "運勢旺盛，如日中天",
      "recommendations": [
        { "type": "財庫", "city": "杭州", "country": "中國", "reason": "...", "coordinates": { "lat": 30.25, "lng": 120.17 } },
        { "type": "流年改運", "city": "大阪", "country": "日本", "reason": "利於改運、轉運或開運（勿寫事業人脈）", "coordinates": { "lat": 34.69, "lng": 135.50 } },
        { "type": "感情", "city": "巴黎", "country": "法國", "reason": "...", "coordinates": { "lat": 48.86, "lng": 2.35 } }
      ]
    }
    範例僅供欄位格式參考，實際必須依使用者命盤選**不同**城市。
  `;

  const birthTimeStr = formData.birthTime
    ? `${formData.birthTime}時 (${SHICHEN_RANGE[formData.birthTime] ?? formData.birthTime})`
    : '未知（以午時推算）';
  const userPrompt = `姓名：${formData.name}, 生日：${formData.birthDate}, 出生地：${formData.birthPlace || '未填'}, 出生時辰：${birthTimeStr}, 性別：${formData.gender || "未知"}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    content = content.replace(/<think>[\s\S]*?<\/think>/g, '');
    content = content.replace(/```json/g, '').replace(/```/g, '');
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      resultCache.set(cacheKey, { data: parsed, expires: Date.now() + CACHE_TTL_MS });
      return parsed;
    } else {
      throw new Error("無法解析 JSON");
    }
  } catch (error: unknown) {
    console.error("💥 算命失敗:", error);
    throw new Error(error instanceof Error ? error.message : "AI 運算失敗");
  }
}
