# 🔧 商品外卖链接不显示 - 故障排查指南

## 📋 问题描述

**商品ID**: `a6e3c709-ff3d-418e-a637-1b5217189a17`

**现象**: 前台商品详情页没有显示添加的外卖平台链接

---

## 🔍 排查步骤

### 步骤 1: 检查数据库是否有数据

在 **Supabase SQL Editor** 中执行以下查询：

```sql
-- 查看该商品的所有外卖链接
SELECT 
  id,
  platform_key,
  platform_name,
  platform_icon,
  shop_url,
  is_enabled,
  sort_order
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
ORDER BY sort_order;
```

**可能的结果**:

#### ✅ 情况 A: 有数据且已启用
```
id | platform_key | platform_name | is_enabled | shop_url
---|--------------|---------------|------------|------------------
1  | meituan      | 美团外卖       | true       | https://...
2  | eleme        | 饿了么         | true       | https://...
```

**结论**: 数据正确，问题可能在前端代码或缓存

**解决方案**: 
- 刷新页面（Ctrl+F5）
- 清除浏览器缓存
- 重启开发服务器

---

#### ❌ 情况 B: 有数据但未启用
```
id | platform_key | platform_name | is_enabled | shop_url
---|--------------|---------------|------------|------------------
1  | meituan      | 美团外卖       | false      | https://...
```

**结论**: 链接被禁用了

**解决方案**:
1. 访问后台 `/admin/products/[商品ID]/edit`
2. 滚动到"外卖平台链接"区域
3. 打开"启用"开关
4. 保存并刷新前台

或者直接在数据库中修改：
```sql
UPDATE product_waimai_links
SET is_enabled = true
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';
```

---

#### ❌ 情况 C: 没有数据
```
(0 rows)
```

**结论**: 还没有为该商品添加外卖链接

**解决方案**: 

**方法 1: 通过后台添加（推荐）**
1. 访问 `/admin/products/[商品ID]/edit`
2. 点击"+ 添加平台"
3. 填写信息：
   - 选择平台：美团外卖
   - 店铺链接：`https://meituan.com/shop/xxx`
   - 勾选"启用"
4. 点击"添加"

**方法 2: 直接插入数据库**
```sql
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
```

---

### 步骤 2: 检查前端控制台日志

**操作**:
1. 打开浏览器开发者工具（F12）
2. 访问商品详情页
3. 查看 Console 中的日志

**应该看到**:
```
Product a6e3c709-ff3d-418e-a637-1b5217189a17:
- Name: 黄老牛肉干
- Links count: 2
- Links: [Array(2)]
```

**如果 Links count 为 0**:
- 说明数据库中没有查询到数据
- 回到步骤 1 检查数据库

**如果有错误信息**:
- 记录错误内容
- 检查 Supabase 连接是否正常

---

### 步骤 3: 检查 RLS 权限策略

在 **Supabase SQL Editor** 中执行：

```sql
-- 查看表的 RLS 策略
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
```

**应该有的策略**:
```
policyname: "Allow authenticated users to read product waimai links"
roles: authenticated
cmd: SELECT
```

**如果没有策略或策略不正确**:
```sql
-- 启用 RLS
ALTER TABLE product_waimai_links ENABLE ROW LEVEL SECURITY;

-- 创建读取策略
DROP POLICY IF EXISTS "Allow public read access for product waimai links" 
ON product_waimai_links;

CREATE POLICY "Allow public read access for product waimai links"
ON product_waimai_links FOR SELECT
TO public
USING (is_enabled = true);
```

---

### 步骤 4: 检查表结构

```sql
-- 查看表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'product_waimai_links'
ORDER BY ordinal_position;
```

**应该有的字段**:
```
column_name    | data_type
---------------|-----------
id             | uuid
product_id     | uuid
platform_key   | text
platform_name  | text
platform_icon  | text
shop_url       | text
product_url    | text
is_enabled     | boolean
sort_order     | integer
created_at     | timestamp
updated_at     | timestamp
```

**如果缺少字段**:
需要执行建表脚本 `create-product-waimai-links-table.sql`

---

## 🎯 常见原因和解决方案

### 原因 1: 数据库中没有数据 ⭐⭐⭐⭐⭐

**最常见原因**：还没有在后台为该商品添加外卖链接

**验证方法**:
```sql
SELECT COUNT(*) FROM product_waimai_links 
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';
```

**解决**: 按照步骤 1 的方法添加数据

---

### 原因 2: 链接未启用 ⭐⭐⭐

**验证方法**:
```sql
SELECT is_enabled FROM product_waimai_links 
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';
```

**解决**: 在后台打开启用开关，或执行：
```sql
UPDATE product_waimai_links 
SET is_enabled = true 
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';
```

---

### 原因 3: 浏览器缓存 ⭐⭐

**验证方法**: 
- 打开无痕模式访问商品页
- 如果无痕模式正常，说明是缓存问题

**解决**: 
- Ctrl+F5 强制刷新
- 清除浏览器缓存

---

### 原因 4: RLS 权限问题 ⭐

**验证方法**:
```sql
-- 以匿名角色测试查询
SET ROLE anon;
SELECT * FROM product_waimai_links 
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true;
```

**解决**: 参考步骤 3 修复 RLS 策略

---

### 原因 5: 服务端组件未重新编译 ⭐

**验证方法**:
- 查看终端是否有 Next.js 编译错误
- 检查 `.next` 文件夹是否过期

**解决**:
```bash
# 停止开发服务器
# 删除 .next 文件夹
rm -rf .next

# 重新启动
npm run dev
```

---

## 📊 完整诊断脚本

复制以下 SQL 到 Supabase SQL Editor 执行：

```sql
-- ========================================
-- 完整诊断脚本
-- ========================================

-- 1. 商品信息
SELECT '=== 商品信息 ===' as section;
SELECT 
  id,
  name,
  status,
  created_at
FROM products
WHERE id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';

-- 2. 所有外卖链接
SELECT '=== 所有外卖链接 ===' as section;
SELECT 
  id,
  platform_key,
  platform_name,
  platform_icon,
  shop_url,
  is_enabled,
  sort_order
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
ORDER BY sort_order;

-- 3. 已启用的链接
SELECT '=== 已启用的链接 ===' as section;
SELECT 
  id,
  platform_key,
  platform_name,
  shop_url
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true
ORDER BY sort_order;

-- 4. 统计
SELECT '=== 统计 ===' as section;
SELECT 
  COUNT(*) as total_links,
  SUM(CASE WHEN is_enabled THEN 1 ELSE 0 END) as enabled_links
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';
```

---

## ✅ 验证修复

修复后，按以下步骤验证：

1. **访问商品详情页** → `/product/a6e3c709-ff3d-418e-a637-1b5217189a17`
2. **查看购买渠道区域** → 应该显示按钮
3. **点击按钮** → 应该能跳转到对应平台
4. **检查控制台** → 应该看到正确的日志

---

## 🎨 预期效果

### 正常显示时

```
┌─────────────────────────────────────┐
│  商品名称：黄老牛肉干                │
│  分类：牛肉类                        │
│  商品介绍：...                       │
│                                     │
│  ───────────────────────────────    │
│  选择购买渠道：                      │
│  [🟡 美团外卖] [🔵 饿了么]          │
└─────────────────────────────────────┘
```

### 没有数据时

```
┌─────────────────────────────────────┐
│  商品名称：黄老牛肉干                │
│  分类：牛肉类                        │
│  商品介绍：...                       │
│                                     │
│  ───────────────────────────────    │
│  选择购买渠道：                      │
│  暂无购买渠道，请联系管理员添加      │
└─────────────────────────────────────┘
```

---

## 📞 如需进一步帮助

请提供以下信息：

1. **SQL 查询结果**（步骤 1 的结果）
2. **浏览器控制台日志**（步骤 2 的截图）
3. **是否能在后台看到该商品的外卖链接**

这样可以更快定位问题！

---

**最后更新**: 2026-03-30
