'use client'

import { useEffect, useState } from 'react'
import { ArticleService } from '@/lib/supabase/articles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from '@/components/image-uploader'
import type { Database } from '@/lib/supabase/database.types'

type Article = Database['public']['Tables']['articles']['Insert']

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // 表单数据
  const [formData, setFormData] = useState<Article>({
    title: '',
    summary: '',
    content: '',
    cover: '',
    author: '',
    published_at: new Date().toISOString(),
    is_published: true,
  })

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    try {
      const data = await ArticleService.getAllArticles()
      setArticles(data || [])
    } catch (error) {
      console.error('Failed to load articles:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      if (editingId) {
        await ArticleService.updateArticle(editingId, formData)
      } else {
        await ArticleService.createArticle(formData)
      }
      
      // 重置表单并刷新列表
      resetForm()
      loadArticles()
      alert('保存成功！')
    } catch (error) {
      console.error('Failed to save article:', error)
      alert('保存失败')
    }
  }

  function handleEdit(article: any) {
    setEditingId(article.id)
    setFormData({
      title: article.title,
      summary: article.summary || '',
      content: article.content || '',
      cover: article.cover || '',
      author: article.author || '',
      published_at: article.published_at,
      is_published: article.is_published,
    })
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这篇文章吗？')) return
    
    try {
      await ArticleService.deleteArticle(id)
      loadArticles()
      alert('删除成功')
    } catch (error) {
      console.error('Failed to delete article:', error)
      alert('删除失败')
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      summary: '',
      content: '',
      cover: '',
      author: '',
      published_at: new Date().toISOString(),
      is_published: true,
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
        <h1 className="text-3xl font-bold">文章管理</h1>
        <Button onClick={() => setShowForm(!showForm)} variant="brand">
          {showForm ? '取消添加' : '+ 添加文章'}
        </Button>
      </div>

      {/* 添加/编辑表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg space-y-4">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? '编辑文章' : '添加文章'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">文章标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="author">作者</Label>
              <Input
                id="author"
                value={formData.author || ''}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="黄老板"
              />
            </div>

            <div>
              <Label htmlFor="published_at">发布日期</Label>
              <Input
                id="published_at"
                type="date"
                value={formData.published_at?.split('T')[0]}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  published_at: new Date(e.target.value).toISOString() 
                })}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="cover">封面图片</Label>
              <ImageUploader
                value={formData.cover}
                onChange={(url) => setFormData({ ...formData, cover: url })}
                bucket="articles"
                label="上传封面图片"
                aspectRatio="video"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="summary">摘要</Label>
              <Textarea
                id="summary"
                value={formData.summary || ''}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={3}
                placeholder="简短的文章摘要..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="content">文章内容 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                required
                placeholder="详细的内容..."
              />
            </div>

            <div>
              <Label htmlFor="is_published">发布状态</Label>
              <select
                id="is_published"
                value={formData.is_published ? 'published' : 'draft'}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.value === 'published' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="published">已发布</option>
                <option value="draft">草稿</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="brand">
              {editingId ? '更新文章' : '添加文章'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={resetForm}
            >
              取消
            </Button>
          </div>
        </form>
      )}

      {/* 文章列表 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-sm text-gray-600">封面</th>
              <th className="px-4 py-3 text-left font-medium text-sm text-gray-600">标题</th>
              <th className="px-4 py-3 text-left font-medium text-sm text-gray-600">作者</th>
              <th className="px-4 py-3 text-left font-medium text-sm text-gray-600">日期</th>
              <th className="px-4 py-3 text-left font-medium text-sm text-gray-600">状态</th>
              <th className="px-4 py-3 text-right font-medium text-sm text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  暂无文章，点击右上角"添加文章"创建第一篇文章
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {article.cover ? (
                      <img 
                        src={article.cover} 
                        alt={article.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      <span className="text-2xl">📝</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{article.title}</div>
                      {article.summary && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {article.summary}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {article.author || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(article.published_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      article.is_published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {article.is_published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(article)}
                      className="mr-2"
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(article.id)}
                    >
                      删除
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
