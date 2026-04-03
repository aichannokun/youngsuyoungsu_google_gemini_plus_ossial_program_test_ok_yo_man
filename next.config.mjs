/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Turbopack 관련 경고가 날 경우 아래 옵션이 도움이 됩니다
  devIndicators: {
    appIsrStatus: false,
  },
};

export default nextConfig;
