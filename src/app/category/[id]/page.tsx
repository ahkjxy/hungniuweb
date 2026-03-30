import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CategoryService } from '@/lib/supabase/categories'
import { ProductService } from '@/lib/supabase/products'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: { id: string }
}

// 获取分类和商品数据
async function getCategoryData(categoryId: string) {
  try {
    const [category, childCategories, products] = await Promise.all([
      CategoryService.getCategoryById(categoryId),
      CategoryService.getChildCategories(categoryId),
      ProductService.getProductsByCategory(categoryId),
    ])

    if (!category) {
      return null
    }

    return {
      category,
      childCategories: childCategories || [],
      products: products || [],
    }
  } catch (error) {
    console.error('Failed to load category data:', error)
    return null
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const data = await getCategoryData(params.id)

  if (!data) {
    notFound()
  }

  const { category, childCategories, products } = data

  return (
    <div className="container py-12">
      {/* 分类标题 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-brand-green">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {category.description}
          </p>
        )}
      </div>

      {/* 子分类 */}
      {childCategories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">子分类</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {childCategories.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.id}`}
                className="p-6 bg-gradient-to-br from-brand-green to-brand-green/80 rounded-lg text-white hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-lg">{child.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 商品列表 */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          商品列表 ({products.length})
        </h2>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              该分类下暂无商品
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
