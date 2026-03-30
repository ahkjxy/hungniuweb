'use client'

import { useEffect, useState } from 'react'
import { SiteSettingsService } from '@/lib/supabase/site-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PlatformConfig {
  key: string
  name: string
  url: string
  icon: string
  enabled: boolean
}

export default function AdminWaimaiPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // 平台配置
  const [platforms, setPlatforms] = useState<Record<string, PlatformConfig>>({
    meituan: { key: 'meituan', name: '美团外卖', url: '', icon: '🟡', enabled: true },
    eleme: { key: 'eleme', name: '饿了么', url: '', icon: '🔵', enabled: true },
    jddj: { key: 'jddj', name: '京东到家', url: '', icon: '🟢', enabled: false },
    ddmc: { key: 'ddmc', name: '叮咚买菜', url: '', icon: '🟢', enabled: false },
    hema: { key: 'hema', name: '盒马鲜生', url: '', icon: '🔵', enabled: false },
    yonghui: { key: 'yonghui', name: '永辉生活', url: '', icon: '🔴', enabled: false },
    wechat: { key: 'wechat', name: '微信小程序', url: '', icon: '🟢', enabled: false },
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const settings = await SiteSettingsService.getSettingsAsObject()
      
      // 从配置加载数据
      const updatedPlatforms = { ...platforms }
      
      Object.keys(updatedPlatforms).forEach(platformKey => {
        const prefix = `waimai_${platformKey}`
        if (settings[`${prefix}_name`]) {
          updatedPlatforms[platformKey].name = settings[`${prefix}_name`]
        }
        if (settings[`${prefix}_url`]) {
          updatedPlatforms[platformKey].url = settings[`${prefix}_url`]
        }
        if (settings[`${prefix}_icon`]) {
          updatedPlatforms[platformKey].icon = settings[`${prefix}_icon`]
        }
        if (settings[`${prefix}_enabled`] !== undefined) {
          updatedPlatforms[platformKey].enabled = settings[`${prefix}_enabled`] === 'true'
        }
      })
      
      setPlatforms(updatedPlatforms)
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
      // 批量保存所有平台配置
      const settingsToUpdate: Record<string, string> = {}
      
      Object.values(platforms).forEach(platform => {
        const prefix = `waimai_${platform.key}`
        settingsToUpdate[`${prefix}_name`] = platform.name
        settingsToUpdate[`${prefix}_url`] = platform.url
        settingsToUpdate[`${prefix}_icon`] = platform.icon
        settingsToUpdate[`${prefix}_enabled`] = platform.enabled ? 'true' : 'false'
      })
      
      await SiteSettingsService.updateSettings(settingsToUpdate)
      alert('保存成功！')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  function updatePlatform(key: string, field: keyof PlatformConfig, value: any) {
    setPlatforms(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }))
  }

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">外卖平台配置</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 常用平台 */}
        <div className="grid gap-6 md:grid-cols-2">
          {Object.values(platforms).map((platform) => (
            <Card key={platform.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{platform.icon}</span>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`enabled-${platform.key}`} className="text-sm">启用</Label>
                    <Switch
                      id={`enabled-${platform.key}`}
                      checked={platform.enabled}
                      onCheckedChange={(checked) => 
                        updatePlatform(platform.key, 'enabled', checked)
                      }
                    />
                  </div>
                </div>
                <CardDescription>
                  配置{platform.name}的店铺链接
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`name-${platform.key}`}>平台名称</Label>
                  <Input
                    id={`name-${platform.key}`}
                    value={platform.name}
                    onChange={(e) => updatePlatform(platform.key, 'name', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`url-${platform.key}`}>店铺链接</Label>
                  <Input
                    id={`url-${platform.key}`}
                    value={platform.url}
                    onChange={(e) => updatePlatform(platform.key, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    复制您的店铺分享链接
                  </p>
                </div>
                
                <div>
                  <Label htmlFor={`icon-${platform.key}`}>图标 Emoji</Label>
                  <Input
                    id={`icon-${platform.key}`}
                    value={platform.icon}
                    onChange={(e) => updatePlatform(platform.key, 'icon', e.target.value)}
                    placeholder="🟡"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" variant="brand" disabled={saving}>
            {saving ? '保存中...' : '保存配置'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={() => window.location.href = '/admin/settings'}
          >
            ← 返回网站配置
          </Button>
        </div>
      </form>
    </div>
  )
}
