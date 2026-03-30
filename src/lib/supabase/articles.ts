import { supabase } from './client'
import type { Database } from './database.types'

type Article = Database['public']['Tables']['articles']['Row']
type ArticleInsert = Database['public']['Tables']['articles']['Insert']
type ArticleUpdate = Database['public']['Tables']['articles']['Update']

export class ArticleService {
  // 获取所有已发布的文章
  static async getAllArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  // 获取单篇文章详情
  static async getArticleById(id: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single()
    
    if (error) throw error
    
    // 增加阅读量
    await supabase
      .from('articles')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', id)
    
    return data
  }

  // 获取最新文章（限制数量）
  static async getLatestArticles(limit = 3) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  // ==================== 管理员操作 ====================
  
  // 获取所有文章（包含未发布的）
  static async adminGetAllArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  // 创建文章
  static async createArticle(article: ArticleInsert) {
    const { data, error } = await supabase
      .from('articles')
      .insert(article)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 更新文章
  static async updateArticle(id: string, article: ArticleUpdate) {
    const { data, error } = await supabase
      .from('articles')
      .update(article)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 删除文章
  static async deleteArticle(id: string) {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}
