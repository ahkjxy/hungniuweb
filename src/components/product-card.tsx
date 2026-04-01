import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Database } from '@/lib/supabase/database.types'

type Product = Database['public']['Tables']['products']['Row'] & {
  categories: { id: string; name: string } | null
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white">
        {/* 商品图片 */}
        <div className="relative aspect-square overflow-hidden bg-brand-cream/20">
          {product.cover ? (
            <Image
              src={product.cover}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-green/30">
              <span className="text-6xl">🥩</span>
            </div>
          )}
          
          {/* 推荐标签 */}
          {product.is_featured && (
            <div className="absolute top-4 left-4 bg-brand-gold text-white px-3 py-1 text-sm font-medium rounded-full">
              推荐
            </div>
          )}
          
          {/* 快速操作按钮 */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button className="bg-white text-brand-green px-6 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              立即查看
            </button>
          </div>
        </div>

        {/* 商品信息 */}
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-foreground group-hover:text-brand-green transition-colors">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          {/* 分类信息 */}
          {product.categories && (
            <div className="text-xs text-brand-green mb-2">
              {product.categories.name}
            </div>
          )}
          
          {/* 查看详情 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-brand-green font-medium group-hover:underline">
              了解详情 →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
