const SERVER_LABELS = [
  "Server 1 (AutoEmbed)",
  "Server 2 (VidSrc CC)",
  "Server 3 (2Embed)",
  "Server 4 (VidSrc Pro)",
  "Server 5 (SmashyStream)",
];

const SERVER_BADGES = [
  "Primary",
  "High Uptime",
  "Multi-Language",
  "HD Playback",
  "Backup",
];

function replaceToken(template, token, value) {
  return template.replaceAll(`{${token}}`, encodeURIComponent(String(value)));
}

function buildFromTemplate(template, values) {
  if (!template) return "";

  // Fallback imdbId to tmdbId if imdbId is missing in custom env template
  const effectiveValues = {
    ...values,
    imdbId: values.imdbId || values.tmdbId,
  };

  return Object.entries(effectiveValues).reduce(
    (url, [token, value]) => replaceToken(url, token, value ?? ""),
    template
  );
}

function getDefaultServerUrl(index, { tmdbId, imdbId, type, season, episode }) {
  const isTv = type === "tv";
  const s = season || 1;
  const e = episode || 1;
  const cleanTmdb = String(tmdbId || "").replace(/^omdb_|^tvmaze_|^mal_/, "");

  switch (index) {
    case 0: // Server 1: AutoEmbed
      return isTv
        ? `https://player.autoembed.cc/embed/tv/${cleanTmdb}/${s}/${e}`
        : `https://player.autoembed.cc/embed/movie/${cleanTmdb}`;

    case 1: // Server 2: VidSrc CC
      return isTv
        ? `https://vidsrc.cc/v2/embed/tv/${cleanTmdb}/${s}/${e}`
        : `https://vidsrc.cc/v2/embed/movie/${cleanTmdb}`;

    case 2: // Server 3: 2Embed (IMDb / TMDB Smart Fallback)
      if (imdbId) {
        return isTv
          ? `https://www.2embed.cc/embedtv/${imdbId}?s=${s}&e=${e}`
          : `https://www.2embed.cc/embed/${imdbId}`;
      }
      return isTv
        ? `https://www.2embed.cc/embedtvtmdb/${cleanTmdb}&s=${s}&e=${e}`
        : `https://www.2embed.cc/embedtmdb/${cleanTmdb}`;

    case 3: // Server 4: VidSrc Pro
      return isTv
        ? `https://vidsrc.pro/embed/tv/${cleanTmdb}/${s}/${e}`
        : `https://vidsrc.pro/embed/movie/${cleanTmdb}`;

    case 4: // Server 5: SmashyStream
      return isTv
        ? `https://embed.smashystream.com/playere.php?tmdb=${cleanTmdb}&s=${s}&e=${e}`
        : `https://embed.smashystream.com/playere.php?tmdb=${cleanTmdb}`;

    default:
      return "";
  }
}

export function buildServerConfigs({
  tmdbId,
  imdbId,
  type,
  season,
  episode,
}) {
  const values = { tmdbId, imdbId, type, season, episode };

  return [1, 2, 3, 4, 5].map((num, index) => {
    const envTemplate = process.env[`NEXT_PUBLIC_PLAYER_SERVER_${num}_URL`];
    let url = "";

    if (envTemplate && envTemplate.trim() !== "") {
      url = buildFromTemplate(envTemplate, values);
    } else {
      url = getDefaultServerUrl(index, values);
    }

    return {
      id: `server${num}`,
      name: `Server ${num}`,
      label: SERVER_LABELS[index],
      badge: SERVER_BADGES[index],
      url,
    };
  });
}

export function buildAuthorizedDownloadUrl({ tmdbId, type, season, episode }) {
  const envTemplate = process.env.NEXT_PUBLIC_AUTHORIZED_DOWNLOAD_URL;
  if (envTemplate && envTemplate.trim() !== "") {
    return buildFromTemplate(envTemplate, { tmdbId, type, season, episode });
  }

  const isTv = type === "tv";
  const s = season || 1;
  const e = episode || 1;
  const cleanTmdb = String(tmdbId || "").replace(/^omdb_|^tvmaze_|^mal_/, "");

  return `https://dl.vidsrc.vip/${isTv ? "tv" : "movie"}/${cleanTmdb}${
    isTv ? `/${s}/${e}` : ""
  }`;
}