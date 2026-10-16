import { NextResponse } from "next/server";

const DEFAULT_DOWNLOAD_BASE_URL = "https://autoembed.co/download";
const VALID_TYPES = new Set(["movie", "tv"]);
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;

function getPositiveInteger(value) {
  if (!/^\d+$/.test(value || "")) return null;

  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdbId")?.trim();
  const type = searchParams.get("type")?.trim().toLowerCase() || "movie";
  const season = searchParams.get("season")?.trim();
  const episode = searchParams.get("episode")?.trim();

  if (!tmdbId || !ID_PATTERN.test(tmdbId)) {
    return NextResponse.json(
      { error: "A valid media ID is required" },
      { status: 400 }
    );
  }

  if (!VALID_TYPES.has(type)) {
    return NextResponse.json(
      { error: "Media type must be movie or tv" },
      { status: 400 }
    );
  }

  const baseUrl =
    process.env.DOWNLOAD_BASE_URL?.trim() || DEFAULT_DOWNLOAD_BASE_URL;

  try {
    const downloadUrl = new URL(
      `${type}/${encodeURIComponent(tmdbId)}`,
      `${baseUrl.replace(/\/+$/, "")}/`
    );

    if (type === "tv") {
      const seasonNumber = getPositiveInteger(season);
      const episodeNumber = getPositiveInteger(episode);

      if (!seasonNumber || !episodeNumber) {
        return NextResponse.json(
          { error: "Season and episode are required for TV shows" },
          { status: 400 }
        );
      }

      downloadUrl.pathname += `/${seasonNumber}/${episodeNumber}`;
    }

    return NextResponse.redirect(downloadUrl, 307);
  } catch (error) {
    console.error("Download URL construction failed:", error);
    return NextResponse.json(
      { error: "Unable to create download link" },
      { status: 500 }
    );
  }
}
