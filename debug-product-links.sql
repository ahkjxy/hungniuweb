-- ========================================
-- 检查商品的外卖平台链接
-- ========================================

-- 商品ID: a6e3c709-ff3d-418e-a637-1b5217189a17

-- 1. 查看商品信息
SELECT 
  id,
  name,
  status,
  created_at
FROM products
WHERE id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';

-- 2. 查看该商品的所有外卖平台链接（包含未启用的）
SELECT 
  id,
  product_id,
  platform_key,
  platform_name,
  platform_icon,
  shop_url,
  product_url,
  is_enabled,
  sort_order,
  created_at
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
ORDER BY sort_order;

-- 3. 查看该商品已启用的外卖平台链接
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

-- 4. 统计链接数量
SELECT 
  COUNT(*) as total_links,
  SUM(CASE WHEN is_enabled = true THEN 1 ELSE 0 END) as enabled_links
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';

-- ========================================
-- 如果没有数据，可以执行以下 INSERT 添加测试数据
-- ========================================

/*
INSERT INTO product_waimai_links (
  product_id, 
  platform_key, 
  platform_name, 
  platform_icon, 
  shop_url, 
  is_enabled, 
  sort_order
) VALUES (
  'a6e3c709-ff3d-418e-a637-1b5217189a17',
  'meituan',
  '美团外卖',
  '🟡',
  'https://meituan.com/shop/your-shop-id',
  true,
  1
),
(
  'a6e3c709-ff3d-418e-a637-1b5217189a17',
  'eleme',
  '饿了么',
  '🔵',
  'https://ele.me/shop/your-shop-id',
  true,
  2
);
*/
