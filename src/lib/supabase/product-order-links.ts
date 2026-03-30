import { supabase } from './client'
import type { Database } from './database.types'

type ProductOrderLink = Database['public']['Tables']['product_order_links']['Row']
type ProductOrderLinkInsert = Database['public']['Tables']['product_order_links']['Insert']
type ProductOrderLinkUpdate = Database['public']['Tables']['product_order_links']['Update']

export class ProductOrderLinkService {
  // 获取单个商品的所有购买链接
  static async getLinksByProductId(productId: string) {
    const { data, error } = await supabase
      .from('product_order_links')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) throw error
    return data
  }

  // 批量获取多个商品的购买链接
  static async getLinksByProductIds(productIds: string[]) {
    const { data, error } = await supabase
      .from('product_order_links')
      .select('*')
      .in('product_id', productIds)
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) throw error
    
    // 按商品 ID 分组
    const grouped = data?.reduce((acc, link) => {
      if (!acc[link.product_id]) {
        acc[link.product_id] = []
      }
      acc[link.product_id].push(link)
      return acc
    }, {} as Record<string, typeof data>)
    
    return grouped || {}
  }

  // ==================== 管理员操作 ====================
  
  // 获取商品的所有链接（包含未启用的）
  static async adminGetLinksByProductId(productId: string) {
    const { data, error } = await supabase
      .from('product_order_links')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order')
    
    if (error) throw error
    return data
  }

  // 创建链接
  static async createLink(link: ProductOrderLinkInsert) {
    const { data, error } = await supabase
      .from('product_order_links')
      .insert(link)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 更新链接
  static async updateLink(id: string, link: ProductOrderLinkUpdate) {
    const { data, error } = await supabase
      .from('product_order_links')
      .update(link)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 删除链接
  static async deleteLink(id: string) {
    const { error } = await supabase
      .from('product_order_links')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  // 批量更新商品的所有链接
  static async batchUpdateLinks(productId: string, links: ProductOrderLinkInsert[]) {
    // 先删除旧的
    await supabase
      .from('product_order_links')
      .delete()
      .eq('product_id', productId)
    
    // 再插入新的
    if (links.length > 0) {
      const { error } = await supabase
        .from('product_order_links')
        .insert(links)
      
      if (error) throw error
    }
    
    return true
  }
}
