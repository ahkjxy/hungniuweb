import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteSettingsService } from '@/lib/supabase/site-settings'

export async function Header() {
  const settings = await SiteSettingsService.getSettingsAsObject()
  const siteName = settings.site_name || '淋淋园牛羊肉'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {settings.logo ? (
            <img src={settings.logo} alt={siteName} className="h-8 w-auto" />
          ) : (
            <div className="text-2xl font-bold text-brand-green">
              🐂 {siteName}
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium text-foreground hover:text-brand-green transition-colors"
          >
            首页
          </Link>
          <Link 
            href="/category" 
            className="text-sm font-medium text-foreground hover:text-brand-green transition-colors"
          >
            所有分类
          </Link>
          <Link 
            href="/products" 
            className="text-sm font-medium text-foreground hover:text-brand-green transition-colors"
          >
            全部商品
          </Link>
          <Link 
            href="/articles" 
            className="text-sm font-medium text-foreground hover:text-brand-green transition-colors"
          >
            品牌故事
          </Link>
          <Link 
            href="/about" 
            className="text-sm font-medium text-foreground hover:text-brand-green transition-colors"
          >
            关于我们
          </Link>
        </nav>

      </div>
    </header>
  )
}
