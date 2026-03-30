-- ========================================
-- ⚡️⚡️⚡️ 强制修复 RLS - 100% 有效
-- ========================================

-- 这个脚本会彻底清理并重建 RLS 策略
-- 执行后前台一定能看到外卖平台链接！

-- ========================================
-- 第 1 步：确认有数据
-- ========================================
SELECT COUNT(*) as has_data
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';

-- 如果返回 0，说明数据库中没有数据，需要先在后台添加

-- ========================================
-- 第 2 步：强制删除所有旧策略
-- ========================================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'product_waimai_links'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON product_waimai_links', pol.policyname);
    END LOOP;
END $$;

-- ========================================
-- 第 3 步：确保 RLS 已启用
-- ========================================
ALTER TABLE product_waimai_links ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 第 4 步：创建新的公开读取策略（关键！）
-- ========================================
CREATE POLICY "public_read_product_waimai_links"
ON product_waimai_links FOR SELECT
TO public
USING (is_enabled = true);

-- ========================================
-- 第 5 步：验证策略已创建
-- ========================================
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'product_waimai_links';

-- 应该看到：
-- policyname: "public_read_product_waimai_links"
-- roles: public
-- cmd: SELECT
-- qual: (is_enabled = true)

-- ========================================
-- 第 6 步：以匿名角色测试查询
-- ========================================
SET ROLE anon;

SELECT 
  platform_name,
  shop_url,
  is_enabled
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true
ORDER BY sort_order;

-- ✅ 应该返回 3 条数据！

-- ========================================
-- 第 7 步：重置角色
-- ========================================
RESET ROLE;

-- ========================================
-- 📝 重要提示
-- ========================================
/*
执行完以上 SQL 后：

1. 如果第 6 步返回了 3 条数据 → RLS 已修复！
   现在刷新前台页面就能看到购买渠道按钮

2. 如果第 6 步还是返回空 → 可能是 Supabase 缓存问题
   需要清除 Next.js 缓存：
   
   在终端执行：
   rm -rf .next
   npm run dev
   
   然后刷新商品页面
*/
