'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUploader } from '@/components/image-uploader'
import Image from 'next/image'
import type { Database } from '@/lib/supabase/database.types'

type Banner = Database['public']['Tables']['banners']['Row']
type BannerInsert = Database['public']['Tables']['banners']['Insert']
type BannerUpdate = Database['public']['Tables']['banners']['Update']

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<BannerUpdate>({
    title: '',
    image_url: '',
    link_url: '',
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    loadBanners()
  }, [])

  async function loadBanners() {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order')
      
      if (error) throw error
      setBanners(data || [])
    } catch (error) {
      console.error('Failed to load banners:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      if (editingId) {
        // 更新轮播图
        const { error } = await supabase
          .from('banners')
          .update({
            title: formData.title,
            image_url: formData.image_url,
            link_url: formData.link_url,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
          } as Database['public']['Tables']['banners']['Update'])
          .eq('id', editingId)
        
        if (error) throw error
      } else {
        // 创建轮播图
        const { error } = await supabase
          .from('banners')
          .insert({
            title: formData.title || null,
            image_url: formData.image_url,
            link_url: formData.link_url || null,
            sort_order: formData.sort_order || 0,
            is_active: formData.is_active ?? true,
          } as Database['public']['Tables']['banners']['Insert'])
        
        if (error) throw error
      }
      
      resetForm()
      loadBanners()
    } catch (error) {
      console.error('Failed to save banner:', error)
      alert('保存失败')
    }
  }

  function handleEdit(banner: Banner) {
    setEditingId(banner.id)
    setFormData({
      title: banner.title || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      sort_order: banner.sort_order,
      is_active: banner.is_active,
    })
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个轮播图吗？')) return
    
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      loadBanners()
    } catch (error) {
      console.error('Failed to delete banner:', error)
      alert('删除失败')
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      sort_order: banners.length + 1,
      is_active: true,
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">轮播图管理</h1>
        <Button onClick={() => setShowForm(!showForm)} variant="brand">
          {showForm ? '取消添加' : '+ 添加轮播图'}
        </Button>
      </div>

      {/* 添加/编辑表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg space-y-4">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? '编辑轮播图' : '添加轮播图'}
          </h2>

          <div>
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="显示在轮播图上的标题"
            />
          </div>

          <div>
            <Label htmlFor="image_url">图片</Label>
            <ImageUploader
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              bucket="banners"
              label=""
              aspectRatio="video"
              width={400}
              height={225}
            />
          </div>

          <div>
            <Label htmlFor="link_url">跳转链接</Label>
            <Input
              id="link_url"
              value={formData.link_url || ''}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              placeholder="/category/xxx 或 https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sort_order">排序</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>启用</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="brand">
              {editingId ? '更新' : '创建'}
            </Button>
            <Button type="button" onClick={resetForm} variant="outline">
              取消
            </Button>
          </div>
        </form>
      )}

      {/* 轮播图列表 */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">预览</th>
              <th className="px-4 py-3 text-left text-sm font-medium">标题</th>
              <th className="px-4 py-3 text-left text-sm font-medium">排序</th>
              <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
              <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="relative w-32 aspect-[16/9] rounded overflow-hidden bg-gray-100">
                    <Image
                      src={banner.image_url}
                      alt={banner.title || 'Banner'}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">{banner.title || '无标题'}</div>
                    {banner.link_url && (
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {banner.link_url}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">{banner.sort_order}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    banner.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {banner.is_active ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(banner)}
                    className="mr-2"
                  >
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(banner.id)}
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
