import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ProductService } from '@/lib/supabase/products'
import { ProductWaimaiLinksService } from '@/lib/supabase/product-waimai-links'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: { id: string }
}

// 获取商品详情数据
async function getProductData(productId: string) {
  try {
    const product = await ProductService.getProductById(productId)
    
    if (!product) {
      console.error('Product not found:', productId)
      return null
    }

    // 获取该商品的购买链接
    const productLinks = await ProductWaimaiLinksService.getLinksByProduct(productId)
    
    // 调试日志
    console.log(`Product ${productId}:`)
    console.log('- Name:', product.name)
    console.log('- Links count:', productLinks?.length || 0)
    console.log('- Links:', productLinks)
    
    // 获取同分类的其他商品作为推荐
    let relatedProducts: any[] = []
    if (product.category_id) {
      const allProducts = await ProductService.getProductsByCategory(product.category_id)
      relatedProducts = (allProducts || [])
        .filter(p => p.id !== productId)
        .slice(0, 4)
    }

    return {
      product,
      productLinks: productLinks || [],
      relatedProducts,
    }
  } catch (error) {
    console.error('Failed to load product data:', error)
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const data = await getProductData(params.id)

  if (!data) {
    notFound()
  }

  const { product, productLinks, relatedProducts } = data

  return (
    <div className="container py-12">
      {/* 返回按钮 */}
      <Link href="/products" className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground">
        ← 返回商品列表
      </Link>

      {/* 商品详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* 商品图片 */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-brand-beige/20">
          {product.cover ? (
            <Image
              src={product.cover}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-green/30">
              <span className="text-9xl">🥩</span>
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="space-y-6">
          {/* 标题 */}
          <div>
            <h1 className="text-4xl font-bold mb-4 text-brand-green">
              {product.name}
            </h1>
            
            {product.categories && (
              <Link
                href={`/category/${product.categories.id}`}
                className="text-sm text-brand-green hover:underline"
              >
                {product.categories.name}
              </Link>
            )}
          </div>

          {/* 描述 */}
          {product.description && (
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-2">商品介绍</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* 购买渠道 */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">选择购买渠道</h3>
            
            {productLinks.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {productLinks.map((link) => (
                  <Button
                    key={link.id}
                    asChild
                    variant="brand"
                    size="lg"
                    className="h-12 px-6 rounded-full transition-all hover:scale-105"
                  >
                    <Link href={link.shop_url || '#'} target="_blank" rel="noopener noreferrer">
                      {link.platform_icon && <span className="mr-2">{link.platform_icon}</span>}
                      {link.platform_name}
                    </Link>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                暂无购买渠道，请联系管理员添加
                {/* 调试信息 */}
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <strong>调试信息：</strong>
                  <br />
                  商品ID: {params.id}
                  <br />
                  查询到的链接数：{productLinks.length}
                  <br />
                  如果后台已添加链接但仍显示此消息，请检查 RLS 权限设置
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 相关推荐 */}
      {relatedProducts.length > 0 && (
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold mb-8 text-center text-brand-green">
            相关推荐
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-brand-beige/20 mb-4">
                    {p.cover ? (
                      <Image
                        src={p.cover}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-green/30">
                        <span className="text-6xl">🥩</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {p.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
