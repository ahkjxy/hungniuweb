-- ========================================
-- 🔍 完整诊断：检查数据库数据和 RLS 策略
-- ========================================

-- 商品ID: a6e3c709-ff3d-418e-a637-1b5217189a17

-- ========================================
-- 第 1 步：检查是否有数据
-- ========================================
SELECT 
  id,
  product_id,
  platform_key,
  platform_name,
  platform_icon,
  shop_url,
  is_enabled,
  sort_order,
  created_at
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
ORDER BY sort_order;

-- 预期：应该返回 3 条数据（美团外卖、叮咚买菜、美团外卖）

-- ========================================
-- 第 2 步：检查 RLS 是否启用
-- ========================================
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'product_waimai_links';

-- 预期：rowsecurity = true

-- ========================================
-- 第 3 步：查看当前的 RLS 策略
-- ========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'product_waimai_links'
ORDER BY policyname;

-- 预期：应该看到 "Allow public read access for product waimai links" 策略

-- ========================================
-- 第 4 步：以匿名角色测试查询
-- ========================================
SET ROLE anon;

SELECT 
  id,
  platform_name,
  shop_url,
  is_enabled
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true
ORDER BY sort_order;

-- 如果返回空或报错，说明 RLS 有问题

-- ========================================
-- 第 5 步：重置为默认角色
-- ========================================
RESET ROLE;

-- ========================================
-- 📊 结果解读
-- ========================================
/*
情况 A: 第 1 步返回 0 条数据
说明：数据库中还没有保存成功
解决：在后台重新添加一次，确保点击了"添加"按钮

情况 B: 第 1 步有数据，但第 3 步没有公开读取策略
说明：RLS 策略未创建或已删除
解决：执行下面的修复 SQL

情况 C: 第 1 步有数据，第 3 步有策略，但第 4 步返回空
说明：策略可能配置错误，或者 Supabase 缓存问题
解决：删除旧策略重新创建，然后清除 Next.js 缓存
*/
