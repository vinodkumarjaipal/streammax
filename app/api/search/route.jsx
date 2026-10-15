import { NextResponse } from "next/server";
import { searchGlobalContent } from "@/lib/api";

// Simple in-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Clean up stale entries periodically
  if (rateLimitMap.size > 1000) {
    rateLimitMap.forEach((times, key) => {
      if (times.every((t) => now - t > RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(key);
      }
    });
  }

  return false;
}

export async function GET(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || "";

    // Input sanitization: Trim, slice to max 100 chars, strip potential malicious script tags
    const cleanQuery = rawQuery
      .trim()
      .slice(0, 100)
      .replace(/[<>'"`;]/g, "");

    if (!cleanQuery) {
      return NextResponse.json({ results: [] });
    }

    const results = await searchGlobalContent(cleanQuery);

    return NextResponse.json(
      { results: results || [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("[Search Route Handler Error]:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}