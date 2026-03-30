'use client'

import { useEffect, useState } from 'react'
import { ProductOrderLinkService } from '@/lib/supabase/product-order-links'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProductOrderLink {
  id?: string
  product_id: string
  platform: string
  name: string
  url: string
  icon_url?: string
  is_active: boolean
  sort_order: number
}

interface ProductOrderLinksManagerProps {
  productId: string
}

export function ProductOrderLinksManager({ productId }: ProductOrderLinksManagerProps) {
  const [links, setLinks] = useState<ProductOrderLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadLinks()
  }, [productId])

  async function loadLinks() {
    try {
      const data = await ProductOrderLinkService.adminGetLinksByProductId(productId)
      setLinks(data || [])
    } catch (error) {
      console.error('Failed to load links:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await ProductOrderLinkService.batchUpdateLinks(
        productId,
        links.map(link => ({
          product_id: productId,
          platform: link.platform,
          name: link.name,
          url: link.url,
          icon_url: link.icon_url,
          is_active: link.is_active,
          sort_order: link.sort_order,
        }))
      )
      alert('保存成功！')
      loadLinks()
    } catch (error) {
      console.error('Failed to save links:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  function addLink() {
    setLinks([
      ...links,
      {
        product_id: productId,
        platform: 'custom',
        name: '',
        url: '',
        is_active: true,
        sort_order: links.length + 1,
      },
    ])
  }

  function updateLink(index: number, field: keyof ProductOrderLink, value: any) {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setLinks(newLinks)
  }

  function deleteLink(index: number) {
    setLinks(links.filter((_, i) => i !== index))
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">加载中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">购买渠道</h3>
        <Button onClick={addLink} variant="outline" size="sm">
          + 添加渠道
        </Button>
      </div>

      {links.length > 0 ? (
        <div className="space-y-4 border rounded-lg p-4">
          {links.map((link, index) => (
            <div key={index} className="grid grid-cols-6 gap-3 items-start">
              <div className="col-span-1">
                <Label className="text-xs">平台</Label>
                <select
                  value={link.platform}
                  onChange={(e) => updateLink(index, 'platform', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  <option value="wechat">微信</option>
                  <option value="meituan">美团</option>
                  <option value="eleme">饿了么</option>
                  <option value="custom">自定义</option>
                </select>
              </div>

              <div className="col-span-1">
                <Label className="text-xs">名称</Label>
                <Input
                  value={link.name}
                  onChange={(e) => updateLink(index, 'name', e.target.value)}
                  placeholder="如：微信小程序"
                  className="h-9"
                />
              </div>

              <div className="col-span-2">
                <Label className="text-xs">链接</Label>
                <Input
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  placeholder="https://..."
                  className="h-9"
                />
              </div>

              <div className="col-span-1">
                <Label className="text-xs">排序</Label>
                <Input
                  type="number"
                  value={link.sort_order}
                  onChange={(e) => updateLink(index, 'sort_order', Number(e.target.value))}
                  className="h-9"
                />
              </div>

              <div className="col-span-1 flex items-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={link.is_active}
                    onChange={(e) => updateLink(index, 'is_active', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>启用</span>
                </label>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteLink(index)}
                  className="h-9"
                >
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
          暂无购买渠道，点击上方按钮添加
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <Button onClick={handleSave} variant="brand" disabled={saving}>
          {saving ? '保存中...' : '保存购买渠道'}
        </Button>
        <p className="text-xs text-muted-foreground">
          提示：为每个商品配置独立的下单链接
        </p>
      </div>
    </div>
  )
}
