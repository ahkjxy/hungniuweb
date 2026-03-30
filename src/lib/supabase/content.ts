import { supabase } from './client'
import type { Database } from './database.types'

type Banner = Database['public']['Tables']['banners']['Row']
type CompanyInfo = Database['public']['Tables']['company_info']['Row']
type OrderLink = Database['public']['Tables']['order_links']['Row']

export class ContentService {
  // 获取所有活跃的轮播图
  static async getBanners() {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data
  }

  // 获取公司介绍
  static async getCompanyInfo() {
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
    return data
  }

  // 获取订购链接
  static async getOrderLinks() {
    const { data, error } = await supabase
      .from('order_links')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data
  }
}
