import Image from 'next/image'
import Link from 'next/link'
import { ContentService } from '@/lib/supabase/content'
import { SiteSettingsService } from '@/lib/supabase/site-settings'
import { OrderLinks } from '@/components/order-links'

export const dynamic = 'force-dynamic'

// 获取页面数据
async function getPageData() {
  try {
    const [companyInfo, siteSettings] = await Promise.all([
      ContentService.getCompanyInfo(),
      SiteSettingsService.getSettingsAsObject(),
    ])
    return { 
      companyInfo: companyInfo as any, 
      siteSettings: siteSettings as any 
    }
  } catch (error) {
    console.error('Failed to load page data:', error)
    return { companyInfo: null, siteSettings: {} }
  }
}

export default async function AboutPage() {
  const { companyInfo, siteSettings } = await getPageData()

  return (
    <div className="container py-12">
      {/* 页面标题 */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-green">
          {siteSettings.about_page_title || '关于淋淋园牛羊肉'}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {siteSettings.about_page_subtitle || '专注优质农产品，从草原到您的餐桌'}
        </p>
      </div>

      {/* 品牌故事 */}
      <section className="mb-20">
        <div className="max-w-4xl mx-auto">
          {companyInfo?.cover_image && (
            <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8">
              <Image
                src={companyInfo.cover_image}
                alt={companyInfo.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mb-4 text-brand-green">
              {siteSettings.about_story_title || '我们的故事'}
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {companyInfo?.content || siteSettings.about_story_content || 
                `我们专注于提供优质天然的农产品，从源头把控品质。自有牧场位于内蒙古大草原，采用传统养殖方式，确保每一块肉品都新鲜健康。芝麻油采用古法小磨工艺，保留最纯粹的香味。

黄老板坚持"品质第一，顾客至上"的理念，为您提供最放心的农产品。`}
            </p>
          </div>
        </div>
      </section>

      {/* 核心优势 */}
      <section className="mb-20 bg-brand-cream rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-brand-green">
          {siteSettings.about_advantages_title || '我们的优势'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-brand-green rounded-full flex items-center justify-center text-4xl">
              {siteSettings.about_advantage_1_icon || '🌿'}
            </div>
            <h3 className="text-xl font-bold mb-3">
              {siteSettings.about_advantage_1_title || '天然有机'}
            </h3>
            <p className="text-muted-foreground">
              {siteSettings.about_advantage_1_desc || '源自内蒙古大草原，自然放牧，无激素无抗生素'}
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-brand-green rounded-full flex items-center justify-center text-4xl">
              {siteSettings.about_advantage_2_icon || '🔪'}
            </div>
            <h3 className="text-xl font-bold mb-3">
              {siteSettings.about_advantage_2_title || '现宰现发'}
            </h3>
            <p className="text-muted-foreground">
              {siteSettings.about_advantage_2_desc || '每日新鲜屠宰，冷链配送，保证最佳口感'}
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-brand-green rounded-full flex items-center justify-center text-4xl">
              {siteSettings.about_advantage_3_icon || '🏺'}
            </div>
            <h3 className="text-xl font-bold mb-3">
              {siteSettings.about_advantage_3_title || '古法工艺'}
            </h3>
            <p className="text-muted-foreground">
              {siteSettings.about_advantage_3_desc || '传统石磨工艺，低温冷榨，保留纯正香味'}
            </p>
          </div>
        </div>
      </section>

      {/* 产品分类引导 */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-brand-green">
          {siteSettings.about_products_title || '我们的产品'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-red-700 to-red-900 group cursor-pointer hover:shadow-xl transition-all">
            <Link href="/category?parent=beef" className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">🐄</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {siteSettings.about_product_beef_title || '牛肉类'}
                </h3>
                <p className="text-white/80 text-sm">
                  {siteSettings.about_product_beef_desc || '优质新鲜牛肉产品'}
                </p>
              </div>
            </Link>
          </div>

          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-orange-600 to-orange-800 group cursor-pointer hover:shadow-xl transition-all">
            <Link href="/category?parent=lamb" className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">🐑</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {siteSettings.about_product_lamb_title || '羊肉类'}
                </h3>
                <p className="text-white/80 text-sm">
                  {siteSettings.about_product_lamb_desc || '天然牧场羊肉产品'}
                </p>
              </div>
            </Link>
          </div>

          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-yellow-600 to-yellow-800 group cursor-pointer hover:shadow-xl transition-all">
            <Link href="/category?parent=sesame" className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">🌰</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {siteSettings.about_product_sesame_title || '芝麻油类'}
                </h3>
                <p className="text-white/80 text-sm">
                  {siteSettings.about_product_sesame_desc || '传统工艺芝麻油'}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 订购入口 */}
      <section className="bg-brand-green text-white rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">
          {siteSettings.about_order_title || '立即下单'}
        </h2>
        <p className="text-white/80 mb-8 max-w-2xl mx-auto">
          {siteSettings.about_order_desc || '多个平台任选，便捷购买优质农产品'}
        </p>
        <OrderLinks />
      </section>
    </div>
  )
}
