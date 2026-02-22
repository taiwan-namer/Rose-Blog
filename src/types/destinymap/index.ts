/**
 * DestinyMap types - User input and DeepSeek response structures.
 */

export interface UserInput {
  name: string;
  birthDate: string;
  birthTime: string;
  isUnknownTime: boolean;
}

export interface DeepSeekRecommendationItem {
  type?: string;
  city: string;
  country: string;
  reason: string;
  coordinates?: { lat: number; lng: number };
}

export interface DeepSeekResponse {
  personality_summary: string;
  lucky_elements: string[];
  lucky_direction: string;
  fortune_score: number;
  recommendations: [DeepSeekRecommendationItem, DeepSeekRecommendationItem, DeepSeekRecommendationItem];
}

export interface TravelRecommendation {
  city: string;
  country: string;
  reason: string;
  affiliateUrl: string;
  hotel_url: string;
  activity_url: string;
  flight_url: string;
}
