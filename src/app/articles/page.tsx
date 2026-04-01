import Link from 'next/link'
import Image from 'next/image'
import { ArticleService } from '@/lib/supabase/articles'
import { SiteSettingsService } from '@/lib/supabase/site-settings'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// 获取页面数据
async function getPageData() {
  try {
    const [articles, settings] = await Promise.all([
      ArticleService.getAllArticles(),
      SiteSettingsService.getSettingsAsObject(),
    ])
    return { 
      articles: articles || [],
      settings,
    }
  } catch (error) {
    console.error('Failed to load page data:', error)
    return { articles: [], settings: {} }
  }
}

export default async function ArticlesPage() {
  const { articles, settings } = await getPageData()

  const siteName = settings.site_name || '淋淋园牛羊肉'
  
  return (
    <div className="container py-12">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-brand-green">
          {settings.articles_page_title || `${siteName}的品牌故事`}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {settings.articles_page_desc || `了解${siteName}，分享农产品知识与美食文化`}
        </p>
      </div>

      {/* 文章列表 */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link key={article.id} href={`/article/${article.id}`}>
              <article className="group cursor-pointer">
                {/* 封面图 */}
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-brand-cream/20 mb-4">
                  {article.cover ? (
                    <Image
                      src={article.cover}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-green/30">
                      <span className="text-6xl">📝</span>
                    </div>
                  )}
                </div>

                {/* 文章信息 */}
                <h2 className="text-xl font-bold mb-2 group-hover:text-brand-green transition-colors line-clamp-2">
                  {article.title}
                </h2>

                {article.summary && (
                  <p className="text-muted-foreground mb-3 line-clamp-3">
                    {article.summary}
                  </p>
                )}

                {/* 元信息 */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {article.author && (
                    <span>{article.author}</span>
                  )}
                  {article.published_at && (
                    <time dateTime={article.published_at}>
                      {formatDate(article.published_at)}
                    </time>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">
            暂无文章
          </p>
        </div>
      )}
    </div>
  )
}
