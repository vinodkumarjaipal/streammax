"use client";

import RealStreamPlayer from "./RealStreamPlayer";

export default function VideoPlayer({
  tmdbId,
  movieId,
  id,
  type = "movie",
  season = 1,
  episode = 1,
  title = "this title",
}) {
  const targetId = tmdbId || movieId || id;

  return (
    <RealStreamPlayer
      id={targetId}
      type={type}
      season={season}
      episode={episode}
      title={title}
    />
  );
}