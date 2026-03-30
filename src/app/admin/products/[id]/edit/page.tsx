'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProductService } from '@/lib/supabase/products'
import { CategoryService } from '@/lib/supabase/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from '@/components/image-uploader'
import { ProductWaimaiLinksManager } from '@/components/product-waimai-links-manager'
import type { Database } from '@/lib/supabase/database.types'

type Product = Database['public']['Tables']['products']['Insert']
type Category = Database['public']['Tables']['categories']['Row']

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  
  // 表单数据
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    cover: '',
    category_id: null,
    stock: 0,
    unit: '件',
    is_featured: false,
    status: 'active',
  })

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      const [productData, categoriesData] = await Promise.all([
        ProductService.getProductById(params.id),
        CategoryService.getAllCategories(),
      ])
      
      if (!productData) {
        alert('商品不存在')
        router.push('/admin/products')
        return
      }

      setFormData({
        name: productData.name,
        description: productData.description || '',
        price: productData.price,
        cover: productData.cover || '',
        category_id: productData.category_id,
        stock: productData.stock,
        unit: productData.unit || '件',
        is_featured: productData.is_featured,
        status: productData.status,
      })
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      alert('加载失败')
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      await ProductService.updateProduct(params.id, formData)
      alert('保存成功！')
      router.push('/admin/products')
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link 
          href="/admin/products"
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          ← 返回商品列表
        </Link>
      </div>

      {/* 页面标题 */}
      <h1 className="text-3xl font-bold mb-6">编辑商品</h1>

      {/* 编辑表单 */}
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="p-6 bg-gray-50 rounded-lg space-y-4">
          <h2 className="text-xl font-bold mb-4">商品信息</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">商品名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">分类 *</Label>
              <select
                id="category"
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">无分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="price">价格</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="stock">库存</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="unit">单位</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="如：件、kg、盒"
              />
            </div>

            <div>
              <ImageUploader
                value={formData.cover}
                onChange={(url) => setFormData({ ...formData, cover: url })}
                bucket="products"
                label="封面图片"
                width={400}
                height={400}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">商品描述</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4"
              />
              <span>设为推荐</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.status === 'active'}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  status: e.target.checked ? 'active' : 'inactive' 
                })}
                className="w-4 h-4"
              />
              <span>上架</span>
            </label>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-4">
          <Button type="submit" variant="brand" disabled={saving}>
            {saving ? '保存中...' : '保存商品'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/admin/products')}
          >
            取消
          </Button>
        </div>
      </form>

      {/* 外卖平台链接管理 */}
      <div className="max-w-4xl mt-12 pt-8 border-t">
        <ProductWaimaiLinksManager productId={params.id} />
      </div>
    </div>
  )
}
