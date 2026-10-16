const SERVER_TEMPLATES = [
  process.env.NEXT_PUBLIC_PLAYER_SERVER_1_URL || "",
  process.env.NEXT_PUBLIC_PLAYER_SERVER_2_URL || "",
  process.env.NEXT_PUBLIC_PLAYER_SERVER_3_URL || "",
  process.env.NEXT_PUBLIC_PLAYER_SERVER_4_URL || "",
  process.env.NEXT_PUBLIC_PLAYER_SERVER_5_URL || "",
];

const SERVER_LABELS = [
  "Licensed Server 1",
  "Licensed Server 2",
  "Licensed Server 3",
  "Licensed Server 4",
  "Licensed Server 5",
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

function buildUrl(template, values) {
  if (!template) return "";

  return Object.entries(values).reduce(
    (url, [token, value]) => replaceToken(url, token, value ?? ""),
    template
  );
}

export function buildServerConfigs({
  tmdbId,
  imdbId,
  type,
  season,
  episode,
}) {
  const values = {
    tmdbId,
    imdbId,
    type,
    season,
    episode,
  };

  return SERVER_TEMPLATES.map((template, index) => ({
    id: `server${index + 1}`,
    name: `Server ${index + 1}`,
    label: SERVER_LABELS[index],
    badge: SERVER_BADGES[index],
    url: buildUrl(template, values),
  }));
}

export function buildAuthorizedDownloadUrl({ tmdbId, type, season, episode }) {
  const template = process.env.NEXT_PUBLIC_AUTHORIZED_DOWNLOAD_URL || "";
  return buildUrl(template, { tmdbId, type, season, episode });
}
