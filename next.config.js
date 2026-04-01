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
  // Node.js 版本检查（允许使用 Node.js 16）
  experimental: {
    // 禁用某些需要 Node.js 18+ 的特性以避免兼容性问题
    serverActions: false,
  }
}

module.exports = nextConfig
