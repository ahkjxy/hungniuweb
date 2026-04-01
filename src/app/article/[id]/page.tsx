import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArticleService } from '@/lib/supabase/articles'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface ArticlePageProps {
  params: { id: string }
}

// 获取文章详情
async function getArticleData(articleId: string) {
  try {
    const article = await ArticleService.getArticleById(articleId)
    
    if (!article) {
      return null
    }

    // 获取其他文章作为推荐
    const allArticles = await ArticleService.getAllArticles()
    const relatedArticles = (allArticles || [])
      .filter(a => a.id !== articleId)
      .slice(0, 3)

    return {
      article,
      relatedArticles,
    }
  } catch (error) {
    console.error('Failed to load article data:', error)
    return null
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const data = await getArticleData(params.id)

  if (!data) {
    notFound()
  }

  const { article, relatedArticles } = data

  return (
    <div className="container py-12">
      {/* 返回按钮 */}
      <Link href="/articles" className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground">
        ← 返回文章列表
      </Link>

      {/* 文章内容 */}
      <article className="max-w-4xl mx-auto">
        {/* 标题 */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-brand-green leading-tight">
          {article.title}
        </h1>

        {/* 元信息 */}
        <div className="flex items-center gap-4 text-muted-foreground mb-8 pb-8 border-b">
          {article.author && (
            <span className="font-medium">{article.author}</span>
          )}
          {article.published_at && (
            <time dateTime={article.published_at}>
              {formatDate(article.published_at)}
            </time>
          )}
          {article.views !== undefined && (
            <span>阅读：{article.views}</span>
          )}
        </div>

        {/* 封面图 */}
        {article.cover && (
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-brand-cream/20 mb-8">
            <Image
              src={article.cover}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* 正文 */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-muted-foreground leading-relaxed space-y-4"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {article.content}
          </div>
        </div>

        {/* 分享区域 */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">分享到</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                微信
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                微博
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* 相关文章 */}
      {relatedArticles.length > 0 && (
        <div className="mt-16 pt-12 border-t">
          <h2 className="text-2xl font-bold mb-8 text-center text-brand-green">
            相关阅读
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((a) => (
              <Link key={a.id} href={`/article/${a.id}`}>
                <article className="group cursor-pointer">
                  {a.cover && (
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-brand-cream/20 mb-4">
                      <Image
                        src={a.cover}
                        alt={a.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-brand-green transition-colors">
                    {a.title}
                  </h3>
                  {a.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {a.summary}
                    </p>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
