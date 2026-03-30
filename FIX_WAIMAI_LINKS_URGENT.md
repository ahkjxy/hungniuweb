# ⚡️ 紧急修复：外卖平台链接不显示（Links count: 0）

## 📋 问题现状

**控制台日志**:
```
Product a6e3c709-ff3d-418e-a637-1b5217189a17:
- Name: 222
- Links count: 0
- Links: []
```

**症状**: 
- ✅ 商品存在（名称：222）
- ❌ 外卖链接数量为 0
- ❌ 页面显示"暂无购买渠道，请联系管理员添加"

---

## 🔍 立即诊断步骤

### 第 1 步：检查数据库中是否有数据

在 **Supabase SQL Editor** 中执行：

```sql
-- 快速检查
SELECT COUNT(*) as total_links
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';
```

**结果解读**:

#### ❌ 如果 `total_links = 0`

**说明**: 数据库中还没有为该商品添加外卖链接

**解决**: 
1. 访问后台 `/admin/products/a6e3c709-ff3d-418e-a637-1b5217189a17/edit`
2. 滚动到页面底部"外卖平台链接"区域
3. 点击"+ 添加平台"
4. 填写信息并保存

或者直接用 SQL 插入测试数据：
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
  'https://meituan.com/shop/test',
  true,
  1
);
```

---

#### ✅ 如果 `total_links > 0`

**说明**: 数据库中有数据，但查询被阻止了

继续第 2 步...

---

### 第 2 步：检查链接是否启用

```sql
-- 查看已启用的链接数量
SELECT COUNT(*) as enabled_links
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true;
```

**结果解读**:

#### ❌ 如果 `enabled_links = 0`

**说明**: 添加了链接但没有启用

**解决**: 

**方法 1: 在后台启用**
1. 访问 `/admin/products/[商品ID]/edit`
2. 找到外卖平台链接区域
3. 打开"启用"开关
4. 保存

**方法 2: 直接 SQL 更新**
```sql
UPDATE product_waimai_links 
SET is_enabled = true 
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';
```

---

#### ✅ 如果 `enabled_links > 0`

**说明**: 数据库中有已启用的链接，但 RLS 权限阻止了查询

**这是最常见的原因！** ⭐⭐⭐⭐⭐

继续第 3 步修复 RLS...

---

## ⚡️ 第 3 步：修复 RLS 权限（关键！）

**立即执行以下 SQL**:

```sql
-- ========================================
-- 修复 RLS 权限 - 让前台能读取外卖链接
-- ========================================

-- 1. 确保启用 RLS
ALTER TABLE product_waimai_links ENABLE ROW LEVEL SECURITY;

-- 2. 删除旧策略
DROP POLICY IF EXISTS "Allow authenticated users to read product waimai links" ON product_waimai_links;
DROP POLICY IF EXISTS "Allow public read access for product waimai links" ON product_waimai_links;

-- 3. 创建新策略（关键！）
CREATE POLICY "Allow public read access for product waimai links"
ON product_waimai_links FOR SELECT
TO public
USING (is_enabled = true);
```

**操作步骤**:
1. 登录 [Supabase Dashboard](https://supabase.com)
2. 进入你的项目
3. 点击左侧 **SQL Editor**
4. 粘贴上面的 SQL
5. 点击 **Run** 执行

---

## ✅ 验证修复成功

### 方法 1: 测试查询

在 SQL Editor 中执行：

```sql
-- 以匿名角色测试
SET ROLE anon;

-- 查询该商品的已启用链接
SELECT 
  platform_name,
  shop_url
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true;
```

**如果返回数据** → ✅ RLS 已修复！

**如果返回空或报错** → ❌ 还需要检查其他问题

---

### 方法 2: 刷新前台页面

1. 访问 `/product/a6e3c709-ff3d-418e-a637-1b5217189a17`
2. 按 Ctrl+F5 强制刷新
3. 查看"选择购买渠道"区域

**应该看到**:
```
选择购买渠道：
[🟡 美团外卖] [🔵 饿了么]
```

---

### 方法 3: 查看浏览器控制台

打开开发者工具（F12），应该看到：
```
[ProductWaimaiLinksService] Fetching links for product: a6e3c709-ff3d-418e-a637-1b5217189a17
[ProductWaimaiLinksService] Found links: 2  ← 不再是 0 了！
Product a6e3c709-ff3d-418e-a637-1b5217189a17:
- Links count: 2
- Links: [Array(2)]
```

---

## 🎯 完整诊断流程

```
开始
  ↓
检查数据库是否有数据？
  ↓
是 → 检查链接是否启用？
  ↓      ↓
否     是 → 执行 RLS 修复 SQL
  ↓      ↓
添加数据   启用链接    ↓
        ↓          刷新前台
        ↓            ↓
        └────→ 成功显示！
```

---

## 📊 常见情况速查表

| 数据库有数据 | 链接已启用 | RLS 正确 | 前台显示 | 解决方案 |
|------------|----------|---------|---------|---------|
| ❌ 无数据 | - | - | ❌ 不显示 | 在后台添加链接 |
| ✅ 有数据 | ❌ 未启用 | - | ❌ 不显示 | 打开启用开关 |
| ✅ 有数据 | ✅ 已启用 | ❌ 错误 | ❌ 不显示 | **执行 RLS 修复** |
| ✅ 有数据 | ✅ 已启用 | ✅ 正确 | ✅ 显示 | 正常，无需操作 |

根据你的情况，**最可能是第三种**！

---

## 🔧 如果 RLS 修复后还是不行

### 可能性 1: 缓存问题

**解决**:
```bash
# 停止开发服务器
rm -rf .next
npm run dev
```

或在浏览器:
- Ctrl+Shift+Delete 清除缓存
- 使用无痕模式测试

---

### 可能性 2: TypeScript 类型缺失

**错误**:
```
Type '{ categories: ... }' has no property 'product_waimai_links'
```

**解决**:
```bash
# 使用 Supabase CLI 生成类型
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

---

### 可能性 3: Supabase 连接问题

**检查**:
1. `.env.local` 文件是否存在
2. `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确

**测试**:
- 访问其他需要 Supabase 的页面是否正常
- 查看终端是否有连接错误

---

## 📞 如需进一步帮助

请提供以下信息：

1. **第 1 步的查询结果**（total_links 数量）
2. **第 2 步的查询结果**（enabled_links 数量）
3. **执行 RLS 修复后的截图**
4. **浏览器控制台完整日志**

---

## 🎉 预期最终效果

### 修复前
```
控制台：
[ProductWaimaiLinksService] Found links: 0

页面：
暂无购买渠道，请联系管理员添加
```

### 修复后
```
控制台：
[ProductWaimaiLinksService] Found links: 2

页面：
选择购买渠道：
[🟡 美团外卖] [🔵 饿了么]
```

---

**立即行动**: 执行第 3 步的 RLS 修复 SQL！🚀

**最后更新**: 2026-03-30
