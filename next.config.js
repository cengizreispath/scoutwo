/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static.zara.net' },
      { protocol: 'https', hostname: 'lp2.hm.com' },
      { protocol: 'https', hostname: 'st.mngbcn.com' },
      { protocol: 'https', hostname: 'static.massimodutti.net' },
      { protocol: 'https', hostname: 'img-koton.mncdn.com' },
      { protocol: 'https', hostname: 'img-lcwaikiki.mncdn.com' },
      { protocol: 'https', hostname: 'cdn.beymen.com' },
      { protocol: 'https', hostname: 'cdn.network.com.tr' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['playwright'],
  },
};

module.exports = nextConfig;
