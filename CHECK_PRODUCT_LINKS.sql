-- ========================================
-- 🔍 检查数据库中的外卖链接数据
-- ========================================

-- 商品ID: a6e3c709-ff3d-418e-a637-1b5217189a17

-- 1️⃣ 查看商品信息（确认商品存在）
SELECT 
  id,
  name,
  status,
  created_at
FROM products
WHERE id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';

-- 2️⃣ 查看所有外卖链接（包含未启用的）
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

-- 3️⃣ 查看已启用的链接（前台应该显示的）
SELECT 
  id,
  platform_key,
  platform_name,
  platform_icon,
  shop_url,
  is_enabled
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true
ORDER BY sort_order;

-- 4️⃣ 统计数量
SELECT 
  COUNT(*) as total_links,
  SUM(CASE WHEN is_enabled THEN 1 ELSE 0 END) as enabled_links,
  SUM(CASE WHEN is_enabled = false THEN 1 ELSE 0 END) as disabled_links
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';

-- ========================================
-- 📊 结果解读
-- ========================================
/*
情况 A: total_links = 0
说明：数据库中还没有为该商品添加外卖链接
解决：在后台编辑该商品，添加外卖平台链接

情况 B: total_links > 0 但 enabled_links = 0
说明：添加了链接但没有启用
解决：在后台打开"启用"开关，或执行：
  UPDATE product_waimai_links 
  SET is_enabled = true 
  WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';

情况 C: enabled_links > 0
说明：数据库中有已启用的链接
问题：RLS 权限阻止了查询
解决：执行 FIX_RLS_NOW.sql 脚本
*/
