/** @type {import('next').NextConfig} */
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

  // Security Headers Setup
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Clickjacking se bachata hai
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // MIME-sniffing rokta hai
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Privacy protect karta hai
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Unused permissions block karta hai
          },
          {
            key: 'Content-Security-Policy',
            // Yahan humne aapke saare image domains ko 'img-src' me allow kar diya hai
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://image.tmdb.org https://*.tmdb.org https://static.tvmaze.com https://cdn.myanimelist.net https://m.media-amazon.com https://ia.media-imdb.com; media-src 'self' blob: data: https:; connect-src 'self' https://api.themoviedb.org https://*.tmdb.org; font-src 'self' data:; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;