import type { Metadata } from 'next'
import { Noto_Sans_SC } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SiteSettingsService } from '@/lib/supabase/site-settings'

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weights: ['400', '500', '700'],
  display: 'swap',
})

// 获取 SEO 配置（服务端）
async function getSeoConfig() {
  try {
    const settings = await SiteSettingsService.getSettingsAsObject()
    const siteName = settings.site_name || '淋淋园牛羊肉'
    return {
      title: settings.seo_title || `${siteName} - 优质农产品品牌`,
      description: settings.seo_description || '专注提供优质天然的农产品，从源头把控品质。主营牛肉类、羊肉类、芝麻油等产品。',
      keywords: settings.seo_keywords || '牛肉，羊肉，芝麻油，农产品，有机食品，健康食品',
    }
  } catch (error) {
    console.error('Failed to load SEO settings:', error)
    return {
      title: '淋淋园牛羊肉 - 优质农产品品牌',
      description: '专注提供优质天然的农产品，从源头把控品质。主营牛肉类、羊肉类、芝麻油等产品。',
      keywords: '牛肉，羊肉，芝麻油，农产品，有机食品，健康食品',
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSeoConfig()
  
  return {
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords.split(',').map(k => k.trim()),
    authors: [{ name: seoConfig.title.split(' - ')[0] }],
    openGraph: {
      title: seoConfig.title,
      description: seoConfig.description,
      type: 'website',
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={notoSans.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
