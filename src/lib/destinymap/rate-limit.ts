import { kv } from "@vercel/kv";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 3600;

function hashIp(ip: string): string {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    const c = ip.charCodeAt(i);
    h = (h << 5) - h + c;
    h |= 0;
  }
  return `ratelimit:${Math.abs(h).toString(36)}`;
}

export async function checkRateLimit(ip: string): Promise<boolean> {
  const key = hashIp(ip);
  const current = (await kv.get<number>(key)) ?? 0;
  if (current >= RATE_LIMIT_MAX) {
    return false;
  }
  const next = current + 1;
  await kv.set(key, next, { ex: RATE_LIMIT_WINDOW_SECONDS });
  return true;
}
