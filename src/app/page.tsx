import { Suspense } from 'react'
import Link from 'next/link'
import { HeroSlider } from '@/components/hero-slider'
import { ProductCard } from '@/components/product-card'
import { OrderLinks } from '@/components/order-links'
import { ProductService } from '@/lib/supabase/products'
import { ContentService } from '@/lib/supabase/content'
import { CategoryService } from '@/lib/supabase/categories'
import { SiteSettingsService } from '@/lib/supabase/site-settings'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

// 首页数据获取（服务端）
async function getHomePageData() {
  try {
    const [featuredProducts, categories, companyInfo, siteSettings] = await Promise.all([
      ProductService.getFeaturedProducts(6),
      CategoryService.getParentCategories(),
      ContentService.getCompanyInfo(),
      SiteSettingsService.getSettingsAsObject(),
    ])

    return {
      featuredProducts: featuredProducts || [],
      categories: categories || [],
      companyInfo,
      siteSettings,
    }
  } catch (error) {
    console.error('Failed to load home page data:', error)
    return {
      featuredProducts: [],
      categories: [],
      companyInfo: null,
      siteSettings: {},
    }
  }
}

export default async function HomePage() {
  const { featuredProducts, categories, companyInfo, siteSettings } = await getHomePageData()

  // 从配置读取网站名称和描述
  const siteName = siteSettings.site_name || '淋淋园牛羊肉'
  const siteDescription = siteSettings.site_description || '精选优质农产品，从草原到餐桌，只为给您最新鲜的美味'

  return (
    <div className="flex flex-col">
      {/* Hero Slider */}
      <Suspense fallback={<div className="h-[400px] md:h-[600px] bg-brand-beige animate-pulse" />}>
        <HeroSlider />
      </Suspense>

      {/* 订购入口 */}
      <section className="bg-brand-cream py-12 border-b">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-brand-green">
              便捷下单 美味即达
            </h2>
            <p className="text-muted-foreground">
              多个平台任选，轻松购买优质农产品
            </p>
          </div>
          <OrderLinks />
        </div>
      </section>

      {/* 产品分类 */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12 text-brand-green">
            产品分类
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category: any) => (
              <Link 
                key={category.id} 
                href={`/category/${category.id}`}
                className="group relative overflow-hidden rounded-lg aspect-[4/3] bg-gradient-to-br from-brand-green to-brand-green/80 hover:shadow-xl transition-all"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:scale-105 transition-transform">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-white/80 text-sm">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 推荐商品 */}
      <section className="py-16 bg-brand-cream">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-brand-green">
              精选推荐
            </h2>
            <p className="text-muted-foreground">
              精心挑选的优质产品，为您呈现最佳口感
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="text-center mt-12">
                <Button asChild variant="brand" size="lg">
                  <Link href="/products">
                    查看全部商品
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              暂无推荐商品
            </div>
          )}
        </div>
      </section>

      {/* 公司介绍 */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-brand-green">
              {companyInfo?.title || siteSettings.about_page_title || '关于我们'}
            </h2>
            
            {companyInfo?.cover_image && (
              <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden">
                <img
                  src={companyInfo.cover_image}
                  alt={companyInfo.title || siteSettings.site_name}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {companyInfo?.content || 
                siteSettings.about_story_content ||
                '我们专注于提供优质天然的农产品，从源头把控品质。自有牧场位于内蒙古大草原，采用传统养殖方式，确保每一块肉品都新鲜健康。芝麻油采用古法小磨工艺，保留最纯粹的香味。'
              }
            </p>
            
            <Button asChild variant="brand" size="lg">
              <Link href="/about">
                了解更多
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
