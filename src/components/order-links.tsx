import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteSettingsService } from '@/lib/supabase/site-settings'

interface PlatformConfig {
  name: string
  url: string
  icon: string
  enabled: boolean
}

export async function OrderLinks() {
  const settings = await SiteSettingsService.getSettingsAsObject()
  
  // 从配置加载所有外卖平台
  const platforms: PlatformConfig[] = [
    {
      name: settings.waimai_meituan_name || '美团外卖',
      url: settings.waimai_meituan_url || '#',
      icon: settings.waimai_meituan_icon || '🟡',
      enabled: settings.waimai_meituan_enabled !== 'false',
    },
    {
      name: settings.waimai_eleme_name || '饿了么',
      url: settings.waimai_eleme_url || '#',
      icon: settings.waimai_eleme_icon || '🔵',
      enabled: settings.waimai_eleme_enabled !== 'false',
    },
    {
      name: settings.waimai_jddj_name || '京东到家',
      url: settings.waimai_jddj_url || '#',
      icon: settings.waimai_jddj_icon || '🟢',
      enabled: settings.waimai_jddj_enabled === 'true',
    },
    {
      name: settings.waimai_ddmc_name || '叮咚买菜',
      url: settings.waimai_ddmc_url || '#',
      icon: settings.waimai_ddmc_icon || '🟢',
      enabled: settings.waimai_ddmc_enabled === 'true',
    },
    {
      name: settings.waimai_hema_name || '盒马鲜生',
      url: settings.waimai_hema_url || '#',
      icon: settings.waimai_hema_icon || '🔵',
      enabled: settings.waimai_hema_enabled === 'true',
    },
    {
      name: settings.waimai_yonghui_name || '永辉生活',
      url: settings.waimai_yonghui_url || '#',
      icon: settings.waimai_yonghui_icon || '🔴',
      enabled: settings.waimai_yonghui_enabled === 'true',
    },
    {
      name: settings.waimai_wechat_name || '微信小程序',
      url: settings.waimai_wechat_url || '#',
      icon: settings.waimai_wechat_icon || '🟢',
      enabled: settings.waimai_wechat_enabled === 'true',
    },
  ].filter(platform => platform.enabled && platform.url) // 只显示启用的且有链接的平台

  if (platforms.length === 0) {
    return (
      <p className="text-muted-foreground">
        暂无订购渠道，请联系管理员添加
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {platforms.map((platform) => (
        <Button
          key={platform.name}
          asChild
          className="h-12 px-6 rounded-full font-medium transition-all hover:scale-105 bg-brand-green hover:bg-brand-green/90 text-white"
          size="lg"
        >
          <Link href={platform.url} target="_blank" rel="noopener noreferrer">
            <span className="mr-2">{platform.icon}</span>
            {platform.name}
          </Link>
        </Button>
      ))}
    </div>
  )
}
