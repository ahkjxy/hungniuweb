'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryService } from '@/lib/supabase/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { Database } from '@/lib/supabase/database.types'
import { ImageUploader } from '@/components/image-uploader'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '' as string | null,
    description: '',
    image_url: '',
    sort_order: 0,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const data = await CategoryService.getAllCategories()
      setCategories(data || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
      alert('加载分类失败')
    } finally {
      setLoading(false)
    }
  }

  function openAddDialog() {
    setEditingCategory(null)
    setFormData({
      name: '',
      parent_id: null,
      description: '',
      image_url: '',
      sort_order: 0,
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      parent_id: category.parent_id,
      description: category.description || '',
      image_url: category.image_url || '',
      sort_order: category.sort_order || 0,
    })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    try {
      if (!formData.name.trim()) {
        alert('请输入分类名称')
        return
      }

      const insertData: CategoryInsert = {
        name: formData.name,
        parent_id: formData.parent_id || null,
        description: formData.description || null,
        image_url: formData.image_url || null,
        sort_order: parseInt(formData.sort_order.toString()),
      }

      if (editingCategory) {
        await CategoryService.updateCategory(editingCategory.id, insertData)
      } else {
        await CategoryService.createCategory(insertData)
      }

      setIsDialogOpen(false)
      loadCategories()
      alert('保存成功！')
    } catch (error: any) {
      console.error('Failed to save category:', error)
      alert('保存失败：' + (error.message || '未知错误'))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个分类吗？其子分类也会被删除。')) {
      return
    }

    try {
      await CategoryService.deleteCategory(id)
      loadCategories()
      alert('删除成功！')
    } catch (error: any) {
      console.error('Failed to delete category:', error)
      alert('删除失败：' + (error.message || '未知错误'))
    }
  }

  // 获取父分类列表（用于选择）
  const parentCategories = categories.filter(c => !c.parent_id)

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-green">分类管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} variant="brand">
              添加分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? '编辑分类' : '添加分类'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">分类名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：牛肉类"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">父分类</Label>
                <select
                  id="parent"
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value || null }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">无（作为顶级分类）</option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  如果选择了父分类，这个分类将成为其子分类
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="分类描述..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">分类图片</Label>
                <ImageUploader
                  value={formData.image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  bucket="categories"
                  label=""
                  width={300}
                  height={300}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort">排序</Label>
                <Input
                  id="sort"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  placeholder="数字越小越靠前"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} variant="brand" className="flex-1">
                  保存
                </Button>
                <Button 
                  onClick={() => setIsDialogOpen(false)} 
                  variant="outline"
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 分类列表 */}
      <Card>
        <CardHeader>
          <CardDescription>
            共 {categories.length} 个分类
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                {/* 图片 */}
                {category.image_url ? (
                  <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                    {category.name.includes('牛肉') && '🐄'}
                    {category.name.includes('羊肉') && '🐑'}
                    {category.name.includes('芝麻') && '🌰'}
                    {!category.name.includes('牛肉') && !category.name.includes('羊肉') && !category.name.includes('芝麻') && '🏷️'}
                  </div>
                )}

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    {category.parent_id && (
                      <span className="text-xs px-2 py-1 bg-muted rounded">
                        子分类
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>排序：{category.sort_order}</span>
                    <span>ID: {category.id.slice(0, 8)}...</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(category)}
                  >
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(category.id)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-6xl mb-4">🏷️</div>
                <p>暂无分类</p>
                <p className="text-sm mt-2">点击右上角"添加分类"开始</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
