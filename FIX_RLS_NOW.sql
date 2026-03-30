-- ========================================
-- ⚡️ 立即执行 - 修复外卖链接 RLS 权限
-- ========================================

-- 这是导致 Links count: 0 的根本原因
-- 执行这个脚本后，前台就能显示外卖平台链接了

-- 步骤 1: 确保启用 RLS
ALTER TABLE product_waimai_links ENABLE ROW LEVEL SECURITY;

-- 步骤 2: 删除可能存在的旧策略
DROP POLICY IF EXISTS "Allow authenticated users to read product waimai links" ON product_waimai_links;
DROP POLICY IF EXISTS "Allow public read access for product waimai links" ON product_waimai_links;

-- 步骤 3: 创建新的公开读取策略（关键！）
CREATE POLICY "Allow public read access for product waimai links"
ON product_waimai_links FOR SELECT
TO public
USING (is_enabled = true);

-- ========================================
-- ✅ 验证 - 执行下面的查询
-- ========================================

-- 查看策略是否创建成功
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'product_waimai_links';

-- 测试以匿名角色查询
SET ROLE anon;

-- 查询该商品的所有已启用链接
SELECT 
  id,
  platform_name,
  shop_url,
  is_enabled
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true;

-- ========================================
-- 📝 说明
-- ========================================
-- 如果上面的查询返回数据，说明 RLS 已修复
-- 刷新前台页面就能看到购买渠道按钮了
