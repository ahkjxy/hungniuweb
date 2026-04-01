/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // 输出为独立模式，方便 PM2 部署
  output: 'standalone',
  // 生产环境配置
  productionBrowserSourceMaps: false,
  // 跳过类型检查
  typescript: {
    ignoreBuildErrors: true,
  },
  // 跳过 ESLint 检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Next.js 13 中启用 App Router 支持（实验性但稳定）
  experimental: {
    appDir: true,
  }
}

module.exports = nextConfig
