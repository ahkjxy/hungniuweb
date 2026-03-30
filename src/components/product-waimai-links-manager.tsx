'use client'

import { useState, useEffect } from 'react'
import { ProductWaimaiLinksService } from '@/lib/supabase/product-waimai-links'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

interface PlatformOption {
  key: string
  name: string
  defaultIcon: string
}

const platformOptions: PlatformOption[] = [
  { key: 'meituan', name: '美团外卖', defaultIcon: '🟡' },
  { key: 'eleme', name: '饿了么', defaultIcon: '🔵' },
  { key: 'jddj', name: '京东到家', defaultIcon: '🟢' },
  { key: 'ddmc', name: '叮咚买菜', defaultIcon: '🟢' },
  { key: 'hema', name: '盒马鲜生', defaultIcon: '🔵' },
  { key: 'yonghui', name: '永辉生活', defaultIcon: '🔴' },
  { key: 'wechat', name: '微信小程序', defaultIcon: '🟢' },
]

interface WaimaiLink {
  id: string
  platform_key: string
  platform_name: string
  platform_icon: string
  shop_url: string
  product_url?: string | null
  is_enabled: boolean
  sort_order: number
}

interface ProductWaimaiLinksManagerProps {
  productId: string
}

export function ProductWaimaiLinksManager({ productId }: ProductWaimaiLinksManagerProps) {
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [links, setLinks] = useState<WaimaiLink[]>([])
  
  // 添加表单数据
  const [newLink, setNewLink] = useState({
    platform_key: 'meituan',
    platform_name: '美团外卖',
    platform_icon: '🟡',
    shop_url: '',
    product_url: '',
    is_enabled: true,
  })

  useEffect(() => {
    loadLinks()
  }, [productId])

  async function loadLinks() {
    try {
      setLoading(true)
      const data = await ProductWaimaiLinksService.getLinksByProduct(productId)
      setLinks(data || [])
    } catch (error) {
      console.error('Failed to load links:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      await ProductWaimaiLinksService.addLink({
        product_id: productId,
        platform_key: newLink.platform_key,
        platform_name: newLink.platform_name,
        platform_icon: newLink.platform_icon,
        shop_url: newLink.shop_url,
        product_url: newLink.product_url || null,
        is_enabled: newLink.is_enabled,
        sort_order: links.length,
      })
      
      // 重置表单并刷新列表
      setNewLink({
        platform_key: 'meituan',
        platform_name: '美团外卖',
        platform_icon: '🟡',
        shop_url: '',
        product_url: '',
        is_enabled: true,
      })
      setShowAddForm(false)
      loadLinks()
      alert('添加成功！')
    } catch (error) {
      console.error('Failed to add link:', error)
      alert('添加失败')
    }
  }

  async function handleToggleEnabled(id: string, currentStatus: boolean) {
    try {
      await ProductWaimaiLinksService.updateLink(id, {
        is_enabled: !currentStatus
      })
      loadLinks()
    } catch (error) {
      console.error('Failed to toggle enabled:', error)
      alert('操作失败')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个平台链接吗？')) return
    
    try {
      await ProductWaimaiLinksService.deleteLink(id)
      loadLinks()
      alert('删除成功')
    } catch (error) {
      console.error('Failed to delete link:', error)
      alert('删除失败')
    }
  }

  function updatePlatform(key: string) {
    const platform = platformOptions.find(p => p.key === key)
    if (platform) {
      setNewLink(prev => ({
        ...prev,
        platform_key: key,
        platform_name: platform.name,
        platform_icon: platform.defaultIcon,
      }))
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">加载中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">外卖平台链接</h3>
        <Button 
          type="button"
          size="sm" 
          variant="outline"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '取消添加' : '+ 添加平台'}
        </Button>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <form onSubmit={handleAddLink} className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform">选择平台</Label>
              <select
                id="platform"
                value={newLink.platform_key}
                onChange={(e) => updatePlatform(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {platformOptions.map(platform => (
                  <option key={platform.key} value={platform.key}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="shop_url">店铺链接 *</Label>
              <Input
                id="shop_url"
                value={newLink.shop_url}
                onChange={(e) => setNewLink({ ...newLink, shop_url: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <Label htmlFor="product_url">商品链接（可选）</Label>
              <Input
                id="product_url"
                value={newLink.product_url}
                onChange={(e) => setNewLink({ ...newLink, product_url: e.target.value })}
                placeholder="留空则使用店铺链接"
              />
            </div>

            <div>
              <Label htmlFor="platform_name">平台名称</Label>
              <Input
                id="platform_name"
                value={newLink.platform_name}
                onChange={(e) => setNewLink({ ...newLink, platform_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="platform_icon">图标 Emoji</Label>
              <Input
                id="platform_icon"
                value={newLink.platform_icon}
                onChange={(e) => setNewLink({ ...newLink, platform_icon: e.target.value })}
              />
            </div>

            <div className="flex items-end gap-2">
              <Switch
                id="is_enabled"
                checked={newLink.is_enabled}
                onCheckedChange={(checked) => setNewLink({ ...newLink, is_enabled: checked })}
              />
              <Label htmlFor="is_enabled">启用此平台</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm">
              添加
            </Button>
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              取消
            </Button>
          </div>
        </form>
      )}

      {/* 链接列表 */}
      {links.length > 0 ? (
        <div className="grid gap-3">
          {links.map((link) => (
            <Card key={link.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{link.platform_icon}</span>
                    <div>
                      <p className="font-medium">{link.platform_name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {link.shop_url}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={link.is_enabled}
                      onCheckedChange={() => handleToggleEnabled(link.id, link.is_enabled)}
                      size="sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(link.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          暂无外卖平台链接，点击上方"添加平台"按钮添加
        </p>
      )}
    </div>
  )
}
