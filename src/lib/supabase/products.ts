import { supabase } from './client'
import type { Database } from './database.types'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export class ProductService {
  // 获取所有商品（带分类信息）
  static async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          parent_id
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  // 获取推荐商品
  static async getFeaturedProducts(limit = 6) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .limit(limit)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data
  }

  // 根据分类获取商品
  static async getProductsByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          parent_id
        )
      `)
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  // 获取单个商品详情
  static async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          parent_id,
          description
        )
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single()
    
    if (error) throw error
    return data
  }

  // 搜索商品
  static async searchProducts(query: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('status', 'active')
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  // ==================== 管理员操作 ====================
  
  // 获取所有商品（包含未激活的）
  static async adminGetAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  // 创建商品
  static async createProduct(product: ProductInsert) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 更新商品
  static async updateProduct(id: string, product: ProductUpdate) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 删除商品
  static async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}
