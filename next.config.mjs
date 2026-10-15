/** @type {import('next').NextPhase} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "static.tvmaze.com",
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com", // OMDb poster images
      },
      {
        protocol: "https",
        hostname: "ia.media-imdb.com",
      },
    ],
  },
};

export default nextConfig;