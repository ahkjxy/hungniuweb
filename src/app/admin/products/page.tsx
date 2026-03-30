'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProductService } from '@/lib/supabase/products'
import { CategoryService } from '@/lib/supabase/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ProductWaimaiLinksManager } from '@/components/product-waimai-links-manager'
import { ImageUploader } from '@/components/image-uploader'
import type { Database } from '@/lib/supabase/database.types'

type Product = Database['public']['Tables']['products']['Insert']
type Category = Database['public']['Tables']['categories']['Row']

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const data = await ProductService.adminGetAllProducts()
      setProducts(data || [])
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个商品吗？')) return
    
    try {
      await ProductService.deleteProduct(id)
      loadProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('删除失败')
    }
  }

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">商品管理</h1>
        <Link href="/admin/products/create">
          <Button variant="brand">
            + 添加商品
          </Button>
        </Link>
      </div>

      {/* 商品列表 */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">商品</th>
              <th className="px-4 py-3 text-left text-sm font-medium">价格</th>
              <th className="px-4 py-3 text-left text-sm font-medium">分类</th>
              <th className="px-4 py-3 text-left text-sm font-medium">库存</th>
              <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
              <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    {product.is_featured && (
                      <span className="text-xs text-brand-gold">★ 推荐</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">¥{Number(product.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm">{product.category_id ? '已分类' : '未分类'}</td>
                <td className="px-4 py-3 text-sm">{product.stock}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {product.status === 'active' ? '上架' : '下架'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                    >
                      编辑
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    删除
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
