import Link from 'next/link'
import { SiteSettingsService } from '@/lib/supabase/site-settings'

export async function Footer() {
  const settings = await SiteSettingsService.getSettingsAsObject()
  
  const currentYear = new Date().getFullYear()
  const copyrightText = settings.footer_text || `© ${currentYear} 淋淋园牛羊肉 版权所有`
  const icpLicense = settings.icp_license || '京 ICP 备 XXXXXXXX 号'
  const wechat = settings.wechat || 'huanglaoban'
  const phone = settings.phone || '400-XXX-XXXX'
  const email = settings.email || 'contact@huanglaoban.com'
  const siteName = settings.site_name || '淋淋园牛羊肉'

  return (
    <footer className="bg-brand-green text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌信息 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">{siteName}</h3>
            <p className="text-sm text-white/80">
              {settings.site_description || '专注提供优质天然的农产品，从源头把控品质。'}
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h4 className="font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-white/80 hover:text-white transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-white/80 hover:text-white transition-colors">
                  全部商品
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-white/80 hover:text-white transition-colors">
                  品牌故事
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                  关于我们
                </Link>
              </li>
            </ul>
          </div>

          {/* 产品分类 */}
          <div>
            <h4 className="font-semibold mb-4">产品分类</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category?parent=beef" className="text-white/80 hover:text-white transition-colors">
                  牛肉类
                </Link>
              </li>
              <li>
                <Link href="/category?parent=lamb" className="text-white/80 hover:text-white transition-colors">
                  羊肉类
                </Link>
              </li>
              <li>
                <Link href="/category?parent=sesame" className="text-white/80 hover:text-white transition-colors">
                  芝麻油类
                </Link>
              </li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h4 className="font-semibold mb-4">联系我们</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>客服微信：{wechat}</li>
              <li>联系电话：{phone}</li>
              <li>邮箱：{email}</li>
            </ul>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
          <p>{copyrightText}</p>
          <p className="mt-2">
            <a 
              href="https://beian.miit.gov.cn" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {icpLicense}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
