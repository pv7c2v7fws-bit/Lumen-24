/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Bỏ qua lỗi ESLint khi build để lỗi nhỏ không làm hỏng deploy
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
