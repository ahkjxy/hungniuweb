import Link from 'next/link'
import { CategoryService } from '@/lib/supabase/categories'
import { ProductService } from '@/lib/supabase/products'

export const dynamic = 'force-dynamic'

// 获取所有父分类及其商品数量
async function getCategoriesData() {
  try {
    const categories = await CategoryService.getParentCategories()
    
    // 获取每个分类的商品数量
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (category) => {
        const products = await ProductService.getProductsByCategory(category.id)
        return {
          ...category,
          productCount: products?.length || 0,
        }
      })
    )
    
    return categoriesWithCount
  } catch (error) {
    console.error('Failed to load categories:', error)
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategoriesData()

  return (
    <div className="container py-12">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-brand-green">
          产品分类
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          精选优质农产品，从草原到餐桌，只为给您最新鲜的美味
        </p>
      </div>

      {/* 分类列表 */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gradient-to-br from-brand-green to-brand-green/80 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center z-10">
                  {/* 分类图标 */}
                  <div className="text-6xl mb-4">
                    {category.name.includes('牛肉') && '🐄'}
                    {category.name.includes('羊肉') && '🐑'}
                    {category.name.includes('芝麻') && '🌰'}
                    {!category.name.includes('牛肉') && !category.name.includes('羊肉') && !category.name.includes('芝麻') && '🏷️'}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                    {category.name}
                  </h2>
                  
                  {category.description && (
                    <p className="text-white/80 text-sm mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  {/* 商品数量 */}
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                    {category.productCount} 个商品
                  </div>
                </div>
              </div>
              
              {/* 悬停效果遮罩 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏷️</div>
          <p className="text-xl text-muted-foreground mb-4">
            暂无分类
          </p>
          <p className="text-sm text-muted-foreground">
            请稍后再来查看
          </p>
        </div>
      )}

      {/* SEO 描述 */}
      <div className="mt-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6 text-brand-green">
          为什么选择我们的农产品？
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl mb-3">🌿</div>
            <h3 className="font-bold mb-2">天然有机</h3>
            <p className="text-sm text-muted-foreground">
              源自天然牧场，无激素无抗生素
            </p>
          </div>
          <div>
            <div className="text-4xl mb-3">🔪</div>
            <h3 className="font-bold mb-2">新鲜直达</h3>
            <p className="text-sm text-muted-foreground">
              每日现宰，冷链配送到家
            </p>
          </div>
          <div>
            <div className="text-4xl mb-3">🏺</div>
            <h3 className="font-bold mb-2">传统工艺</h3>
            <p className="text-sm text-muted-foreground">
              古法制作，保留纯正香味
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
