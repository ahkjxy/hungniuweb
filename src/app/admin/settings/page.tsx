'use client'

import { useEffect, useState } from 'react'
import { SiteSettingsService } from '@/lib/supabase/site-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from '@/components/image-uploader'

interface SiteSetting {
  setting_key: string
  setting_value: string
  setting_type: string
  description: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const data = await SiteSettingsService.getAllSettings()
      setSettings(data || [])
      
      // 初始化表单数据
      const initialData: Record<string, string> = {}
      data?.forEach(setting => {
        initialData[setting.setting_key] = setting.setting_value
      })
      setFormData(initialData)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      await SiteSettingsService.updateSettings(formData)
      alert('保存成功！')
      loadSettings()
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  function updateField(key: string, value: string) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">网站配置</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本信息 */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">基本信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="site_name">网站名称</Label>
              <Input
                id="site_name"
                value={formData.site_name || ''}
                onChange={(e) => updateField('site_name', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo 图片</Label>
              <ImageUploader
                value={formData.logo}
                onChange={(url) => updateField('logo', url)}
                bucket="company"
                label=""
                width={200}
                height={100}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="site_description">网站描述</Label>
            <Textarea
              id="site_description"
              value={formData.site_description || ''}
              onChange={(e) => updateField('site_description', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* 联系方式 */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">联系方式</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wechat">客服微信</Label>
              <Input
                id="wechat"
                value={formData.wechat || ''}
                onChange={(e) => updateField('wechat', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="phone">联系电话</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email">联系邮箱</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="address">公司地址</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 备案信息 */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">备案信息</h2>
          
          <div>
            <Label htmlFor="icp_license">ICP 备案号</Label>
            <Input
              id="icp_license"
              value={formData.icp_license || ''}
              onChange={(e) => updateField('icp_license', e.target.value)}
              placeholder="京 ICP 备 XXXXXXXX 号"
            />
            <p className="text-xs text-muted-foreground mt-1">
              将显示在页脚，点击可跳转到工信部网站
            </p>
          </div>
        </div>

        {/* 页脚信息 */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">页脚信息</h2>
          
          <div>
            <Label htmlFor="footer_text">版权文字</Label>
            <Input
              id="footer_text"
              value={formData.footer_text || ''}
              onChange={(e) => updateField('footer_text', e.target.value)}
            />
          </div>
        </div>

        {/* 关于页面配置 */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">关于页面配置</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="about_page_title">页面标题</Label>
              <Input
                id="about_page_title"
                value={formData.about_page_title || ''}
                onChange={(e) => updateField('about_page_title', e.target.value)}
                placeholder="关于淋淋园牛羊肉"
              />
            </div>

            <div>
              <Label htmlFor="about_page_subtitle">页面副标题</Label>
              <Input
                id="about_page_subtitle"
                value={formData.about_page_subtitle || ''}
                onChange={(e) => updateField('about_page_subtitle', e.target.value)}
                placeholder="专注优质农产品，从草原到您的餐桌"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="about_story_content">品牌故事内容</Label>
            <Textarea
              id="about_story_content"
              value={formData.about_story_content || ''}
              onChange={(e) => updateField('about_story_content', e.target.value)}
              rows={6}
              placeholder="我们专注于提供优质天然的农产品..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              将显示在关于页面的品牌故事部分
            </p>
          </div>
        </div>

        {/* 首页配置 */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">首页配置</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="home_category_title">分类区标题</Label>
              <Input
                id="home_category_title"
                value={formData.home_category_title || ''}
                onChange={(e) => updateField('home_category_title', e.target.value)}
                placeholder="产品分类"
              />
            </div>

            <div>
              <Label htmlFor="home_featured_title">推荐区标题</Label>
              <Input
                id="home_featured_title"
                value={formData.home_featured_title || ''}
                onChange={(e) => updateField('home_featured_title', e.target.value)}
                placeholder="精选推荐"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="home_featured_subtitle">推荐区副标题</Label>
            <Input
              id="home_featured_subtitle"
              value={formData.home_featured_subtitle || ''}
              onChange={(e) => updateField('home_featured_subtitle', e.target.value)}
              placeholder="精心挑选的优质产品，为您呈现最佳口感"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" variant="brand" disabled={saving}>
            {saving ? '保存中...' : '保存配置'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={() => window.location.href = '/admin/banners'}
          >
            管理轮播图 →
          </Button>
        </div>
      </form>
    </div>
  )
}
