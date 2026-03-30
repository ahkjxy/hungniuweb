import type { Metadata } from 'next'
import { Noto_Sans_SC } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '淋淋园牛羊肉 - 优质农产品品牌',
  description: '专注提供优质天然的农产品，从源头把控品质。主营牛肉、羊肉、芝麻油等产品。',
  keywords: '牛肉，羊肉，芝麻油，农产品，有机食品，健康食品',
  authors: [{ name: '淋淋园牛羊肉' }],
  openGraph: {
    title: '淋淋园牛羊肉 - 优质农产品品牌',
    description: '专注提供优质天然的农产品，从源头把控品质。',
    type: 'website',
  },
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
