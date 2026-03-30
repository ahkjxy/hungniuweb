import { ProductService } from '@/lib/supabase/products'
import { ProductCard } from '@/components/product-card'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

// 获取所有商品数据
async function getProducts() {
  try {
    const products = await ProductService.getAllProducts()
    return (products || []).filter(p => p.status === 'active')
  } catch (error) {
    console.error('Failed to load products:', error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="container py-12">
      {/* 页面标题 */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-brand-green">
          全部商品
        </h1>
        <p className="text-muted-foreground">
          浏览我们所有的优质农产品
        </p>
      </div>

      {/* 商品列表 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-block mb-4">
            <Image
              src="/placeholder.svg"
              alt="无商品"
              width={200}
              height={200}
              className="opacity-50"
            />
          </div>
          <p className="text-muted-foreground text-lg">
            暂无商品
          </p>
        </div>
      )}
    </div>
  )
}
