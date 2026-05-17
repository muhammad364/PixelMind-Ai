import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

let ratelimit: Ratelimit | undefined;

if (process.env.UPSTASH_REDIS_REST_URL) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.fixedWindow(5, "1440 m"),
    analytics: true,
    prefix: "blinkshot",
  });
}

export async function POST(req: Request) {
  let json = await req.json();
  let { prompt, iterativeMode, width, height } = z
    .object({
      prompt: z.string(),
      iterativeMode: z.boolean(),
      width: z.number().optional().default(1024),
      height: z.number().optional().default(768),
      userAPIKey: z.string().optional(),
    })
    .parse(json);

  if (ratelimit) {
    const identifier = await getIPAddress();
    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      return Response.json(
        "No requests left. Please try again in 24h.",
        { status: 429 },
      );
    }
  }

  const seed = iterativeMode ? 123 : Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    const imageResponse = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "PixelMindAI/1.0",
      },
    });
    clearTimeout(timeoutId);

    if (!imageResponse.ok) {
      throw new Error(`Pollinations error: ${imageResponse.status}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    uint8Array.forEach((byte) => (binary += String.fromCharCode(byte)));
    const b64_json = btoa(binary);

    return Response.json({ b64_json });
  } catch (e: any) {
    if (e.name === "AbortError") {
      return Response.json(
        { error: "Request timed out. Pollinations.ai took too long. Please try again." },
        { status: 504 }
      );
    }
    return Response.json(
      { error: e.toString() },
      { status: 500 },
    );
  }
}

export const maxDuration = 60;

async function getIPAddress() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headersList.get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}