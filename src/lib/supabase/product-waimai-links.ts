import { supabase } from './client'
import type { Database } from './database.types'

type ProductWaimaiLink = Database['public']['Tables']['product_waimai_links']['Row']
type ProductWaimaiLinkInsert = Database['public']['Tables']['product_waimai_links']['Insert']

export class ProductWaimaiLinksService {
  // 获取某个商品的所有外卖平台链接
  static async getLinksByProduct(productId: string) {
    console.log('[ProductWaimaiLinksService] Fetching links for product:', productId)
    
    const { data, error } = await supabase
      .from('product_waimai_links')
      .select('*')
      .eq('product_id', productId)
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true })
    
    if (error) {
      console.error('[ProductWaimaiLinksService] Error fetching links:', error)
      throw error
    }
    
    console.log('[ProductWaimaiLinksService] Found links:', data?.length || 0)
    return data || []
  }

  // 获取多个商品的外卖链接（批量查询）
  static async getLinksByProducts(productIds: string[]) {
    if (productIds.length === 0) return []
    
    const { data, error } = await supabase
      .from('product_waimai_links')
      .select('*')
      .in('product_id', productIds)
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // ==================== 管理员操作 ====================
  
  // 添加外卖平台链接
  static async addLink(link: ProductWaimaiLinkInsert) {
    const { data, error } = await supabase
      .from('product_waimai_links')
      .insert(link)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 更新外卖平台链接
  static async updateLink(id: string, updates: Partial<ProductWaimaiLink>) {
    const { data, error } = await supabase
      .from('product_waimai_links')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 删除外卖平台链接
  static async deleteLink(id: string) {
    const { error } = await supabase
      .from('product_waimai_links')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  // 批量删除某个商品的所有链接
  static async deleteLinksByProduct(productId: string) {
    const { error } = await supabase
      .from('product_waimai_links')
      .delete()
      .eq('product_id', productId)
    
    if (error) throw error
    return true
  }
}
