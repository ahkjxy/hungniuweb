-- ========================================
-- ⚡️⚡️⚡️ 紧急修复 - RLS 权限问题
-- ========================================

-- 后台已有 3 个链接（美团外卖、叮咚买菜、美团外卖）
-- 但前台显示"暂无购买渠道"
-- 这是典型的 RLS 权限问题！

-- ========================================
-- 第 1 步：查看当前的 RLS 策略
-- ========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'product_waimai_links';

-- ========================================
-- 第 2 步：删除所有旧的 SELECT 策略
-- ========================================
DROP POLICY IF EXISTS "Allow authenticated users to read product waimai links" ON product_waimai_links;
DROP POLICY IF EXISTS "Allow public read access for product waimai links" ON product_waimai_links;
DROP POLICY IF EXISTS "Enable read access for all users" ON product_waimai_links;

-- ========================================
-- 第 3 步：创建新的公开读取策略（关键！）
-- ========================================
CREATE POLICY "Allow public read access for product waimai links"
ON product_waimai_links FOR SELECT
TO public
USING (is_enabled = true);

-- ========================================
-- 第 4 步：验证策略已创建
-- ========================================
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'product_waimai_links';

-- ========================================
-- 第 5 步：测试以匿名角色查询
-- ========================================
SET ROLE anon;

-- 查询该商品的所有已启用链接
SELECT 
  id,
  platform_name,
  shop_url,
  is_enabled
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true
ORDER BY sort_order;

-- ========================================
-- ✅ 预期结果：应该返回 3 条数据
-- ========================================
/*
id | platform_name | shop_url | is_enabled
---|---------------|----------|------------
xx | 美团外卖       | http://... | true
xx | 叮咚买菜       | http://... | true
xx | 美团外卖       | https://...| true
*/

-- ========================================
-- 📝 说明
-- ========================================
/*
如果第 5 步能返回 3 条数据，说明 RLS 已修复！
现在刷新前台页面就能看到购买渠道按钮了。

如果还是返回空或报错，说明：
1. RLS 策略没有正确创建
2. 或者 Supabase 缓存未更新
需要重启开发服务器。
*/
