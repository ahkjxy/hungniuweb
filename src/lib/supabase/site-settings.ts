import { supabase } from './client'
import type { Database } from './database.types'

type SiteSetting = Database['public']['Tables']['site_settings']['Row']
type SiteSettingInsert = Database['public']['Tables']['site_settings']['Insert']
type SiteSettingUpdate = Database['public']['Tables']['site_settings']['Update']

export class SiteSettingsService {
  // 获取所有配置
  static async getAllSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('setting_key')
    
    if (error) throw error
    return data
  }

  // 根据 key 获取单个配置
  static async getSettingByKey(key: string) {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('setting_key', key)
      .maybeSingle()  // 使用 maybeSingle 而不是 single，这样不会在 0 行时报错
    
    if (error) throw error
    return data || null
  }

  // 获取多个配置（作为对象返回）
  static async getSettingsAsObject() {
    const settings = await this.getAllSettings()
    const result: Record<string, string> = {}
    
    settings?.forEach(setting => {
      result[setting.setting_key] = setting.setting_value || ''
    })
    
    return result
  }

  // ==================== 管理员操作 ====================
  
  // 更新配置
  static async updateSetting(key: string, value: string) {
    const { data, error } = await supabase
      .from('site_settings')
      .update({ setting_value: value })
      .eq('setting_key', key)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 批量更新配置
  static async updateSettings(settings: Record<string, string>) {
    const updates = Object.entries(settings).map(async ([key, value]) => {
      await this.updateSetting(key, value)
    })
    
    await Promise.all(updates)
    return true
  }

  // 添加新配置
  static async createSetting(setting: SiteSettingInsert) {
    const { data, error } = await supabase
      .from('site_settings')
      .insert(setting)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // 删除配置
  static async deleteSetting(key: string) {
    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('setting_key', key)
    
    if (error) throw error
    return true
  }
}
