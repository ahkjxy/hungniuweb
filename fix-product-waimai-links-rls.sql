-- ========================================
-- 修复商品外卖平台链接表的 RLS 权限
-- ========================================

-- 问题：前台无法读取 product_waimai_links 表的数据
-- 原因：RLS 策略可能只允许 authenticated 用户读取，但前台是匿名用户
-- 解决：允许所有人读取已启用的链接

-- 1. 确保启用 RLS
ALTER TABLE product_waimai_links ENABLE ROW LEVEL SECURITY;

-- 2. 删除旧的读取策略（如果有）
DROP POLICY IF EXISTS "Allow authenticated users to read product waimai links" ON product_waimai_links;
DROP POLICY IF EXISTS "Allow public read access for product waimai links" ON product_waimai_links;

-- 3. 创建新的公开读取策略（关键！）
CREATE POLICY "Allow public read access for product waimai links"
ON product_waimai_links FOR SELECT
TO public
USING (is_enabled = true);

-- 4. 验证策略
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
WHERE tablename = 'product_waimai_links';

-- ========================================
-- 说明
-- ========================================
-- 这个策略允许任何人（包括未登录用户）查询已启用（is_enabled = true）的外卖链接
-- 管理员仍然可以插入、更新、删除（通过其他策略控制）
