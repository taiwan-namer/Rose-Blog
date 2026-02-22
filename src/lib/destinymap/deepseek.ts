import OpenAI from "openai";
import type { UserInput, DeepSeekResponse, DeepSeekRecommendationItem } from "@/types/destinymap";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const SYSTEM_PROMPT = `Role: You are a "Zi Wei Dou Shu" (Purple Star Astrology) master and a travel consultant.
Language: ALWAYS output in Traditional Chinese (繁體中文).
Style: 語氣請盡量口語、白話、親切，好懂易讀，但仍保留一點神祕感，不要太學術或生硬。
Task: Analyze the user's birth data. If "is_time_unknown" is true, ignore the "Hour" pillar and provide a general date-based reading.
Output Format: JSON ONLY. No markdown, no conversational text.
JSON Structure:
{
  "personality_summary": "String (Max 60 chars, mystical tone)",
  "lucky_elements": ["Element1", "Element2"],
  "lucky_direction": "String (e.g., 南方)",
  "fortune_score": Integer (1-100),
  "recommendations": [
    {
      "city": "String (City Name)",
      "country": "String (Country Name)",
      "reason": "String (Why this fits the user's stars)"
    }
  ]
}`;

function buildUserPrompt(input: UserInput): string {
  return `Name: ${input.name}, Date: ${input.birthDate}, Time: ${input.birthTime}, UnknownTime: ${input.isUnknownTime}`;
}

const FALLBACK_RESULT: DeepSeekResponse = {
  personality_summary: "命運數據解析中，星象顯示您具有堅韌的特質。（AI 連線不穩定，此為備用數據）",
  lucky_elements: ["木", "火"],
  lucky_direction: "東方",
  fortune_score: 88,
  recommendations: [
    { city: "京都", country: "日本", reason: "備用數據：東方木氣旺盛，適合調養身心。" },
    { city: "維也納", country: "奧地利", reason: "備用數據：西方金水相生，激發藝術靈感。" },
    { city: "清邁", country: "泰國", reason: "備用數據：南方火土相生，適合創業思考。" },
  ],
};

function cleanAndParseJSON(content: string): unknown {
  let clean = content.replace(/<think>[\s\S]*?<\/think>/gi, "");
  clean = clean.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(clean);
  } catch {
    throw new Error("Invalid DeepSeek response structure");
  }
}

function parseResponse(content: string): DeepSeekResponse {
  try {
    const json = cleanAndParseJSON(content);
    const r = json as {
      personality_summary?: string;
      lucky_elements?: string[];
      lucky_direction?: string;
      fortune_score?: number;
      recommendations?: unknown[];
    };
    if (
      typeof r.personality_summary !== "string" ||
      !Array.isArray(r.lucky_elements) ||
      typeof r.lucky_direction !== "string" ||
      typeof r.fortune_score !== "number" ||
      !Array.isArray(r.recommendations) ||
      r.recommendations.length !== 3
    ) {
      throw new Error("Invalid DeepSeek response structure");
    }
    const recs = r.recommendations as Array<{ city?: string; country?: string; reason?: string }>;
    const recommendations: [DeepSeekRecommendationItem, DeepSeekRecommendationItem, DeepSeekRecommendationItem] = [
      { city: String(recs[0]?.city ?? ""), country: String(recs[0]?.country ?? ""), reason: String(recs[0]?.reason ?? "") },
      { city: String(recs[1]?.city ?? ""), country: String(recs[1]?.country ?? ""), reason: String(recs[1]?.reason ?? "") },
      { city: String(recs[2]?.city ?? ""), country: String(recs[2]?.country ?? ""), reason: String(recs[2]?.reason ?? "") },
    ];
    return {
      personality_summary: r.personality_summary,
      lucky_elements: r.lucky_elements,
      lucky_direction: r.lucky_direction,
      fortune_score: r.fortune_score,
      recommendations,
    };
  } catch {
    return FALLBACK_RESULT;
  }
}

export async function getDestinyAnalysis(input: UserInput): Promise<DeepSeekResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);
  const completion = await client.chat.completions.create(
    {
      model: "deepseek-chat",
      temperature: 1.1,
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
    },
    { signal: controller.signal }
  );
  clearTimeout(timeoutId);

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty DeepSeek response");
  }
  return parseResponse(content);
}
