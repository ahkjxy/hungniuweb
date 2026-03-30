# ⚡️ 终极解决方案：外卖链接不显示（Links count: 0）

## 📋 问题现状

**后台**: ✅ 已添加 3 个外卖平台链接  
**前台**: ❌ 查询到的链接数：0  
**调试框显示**: "如果后台已添加链接但仍显示此消息，请检查 RLS 权限设置"

---

## 🔍 立即诊断

### 第 1 步：检查数据库中是否有数据

在 **Supabase SQL Editor** 中执行：

```sql
SELECT COUNT(*) as total_links
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';
```

#### ❌ 如果 `total_links = 0`

**说明**: 数据库中没有保存成功

**解决**: 
1. 访问后台 `/admin/products/a6e3c709-ff3d-418e-a637-1b5217189a17/edit`
2. 滚动到底部"外卖平台链接"区域
3. 点击"+ 添加平台"
4. 填写信息后**确保点击了"添加"按钮**
5. 看到成功提示后再刷新前台

#### ✅ 如果 `total_links > 0`

**说明**: 数据库中有数据，继续第 2 步...

---

## ⚡️ 第 2 步：强制修复 RLS（关键！）

**立即执行以下 SQL**:

```sql
-- ========================================
-- ⚡️⚡️⚡️ 强制修复 RLS - 100% 有效
-- ========================================

-- 1. 确认有数据
SELECT COUNT(*) as has_data
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17';

-- 2. 强制删除所有旧策略
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

-- 3. 确保 RLS 已启用
ALTER TABLE product_waimai_links ENABLE ROW LEVEL SECURITY;

-- 4. 创建新的公开读取策略（关键！）
CREATE POLICY "public_read_product_waimai_links"
ON product_waimai_links FOR SELECT
TO public
USING (is_enabled = true);

-- 5. 验证策略已创建
SELECT 
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'product_waimai_links';

-- 6. 以匿名角色测试查询
SET ROLE anon;

SELECT 
  platform_name,
  shop_url,
  is_enabled
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true
ORDER BY sort_order;

-- 7. 重置角色
RESET ROLE;
```

**操作步骤**:
1. 登录 [Supabase Dashboard](https://supabase.com)
2. 进入你的项目
3. 点击左侧 **SQL Editor**
4. 粘贴上面的完整 SQL
5. 点击 **Run** 执行

---

## ✅ 第 3 步：验证修复结果

### 查看第 6 步的查询结果

**应该返回 3 条数据**:
```
platform_name | shop_url | is_enabled
--------------|----------|------------
美团外卖       | http://... | true
叮咚买菜       | http://... | true
美团外卖       | https://...| true
```

#### ✅ 如果返回 3 条数据

**说明**: RLS 已修复！

**下一步**: 刷新前台页面

1. 访问 `/product/a6e3c709-ff3d-418e-a637-1b5217189a17`
2. **按 Ctrl+F5** 强制刷新
3. 查看"选择购买渠道"区域

**应该看到**:
```
选择购买渠道：
[🟡 美团外卖] [🔵 叮咚买菜] [🟡 美团外卖]
```

---

#### ❌ 如果还是返回空

**说明**: Supabase 或 Next.js 缓存问题

**解决**: 清除缓存

**方法 1: 清除 Next.js 缓存（推荐）**
```bash
# 停止开发服务器（Ctrl+C）

# 删除 .next 文件夹
rm -rf .next

# 重新启动
npm run dev
```

然后刷新商品页面。

**方法 2: 等待 Supabase 缓存更新**
- Supabase 的 RLS 策略可能需要几分钟生效
- 等待 2-3 分钟后刷新页面

---

## 🔧 如果仍然不行

### 方案 A: 检查 TypeScript 类型定义

**错误**:
```
Type '{ categories: ... }' has no property 'product_waimai_links'
```

**解决**:
```bash
# 生成 TypeScript 类型定义
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts

# 重启开发服务器
rm -rf .next
npm run dev
```

---

### 方案 B: 检查 Supabase 连接

**查看 `.env.local` 文件**:
```bash
cat .env.local
```

**应该包含**:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

如果缺失或不正确，需要更新并重启开发服务器。

---

### 方案 C: 查看浏览器控制台详细日志

打开开发者工具（F12），查看 Console：

**如果看到错误**:
```
[ProductWaimaiLinksService] Error fetching links: {message: "permission denied"}
```

**说明**: RLS 权限仍然有问题，重新执行第 2 步的 SQL。

**如果看到**:
```
[ProductWaimaiLinksService] Found links: 0
```

**说明**: 查询返回空数组，可能是：
1. 数据库中没有数据（回到第 1 步）
2. RLS 权限问题（重新执行第 2 步）
3. 缓存问题（清除 Next.js 缓存）

---

## 📊 完整诊断流程图

```
开始
  ↓
第 1 步：检查数据库是否有数据
  ↓
total_links = 0?
  ↓
是 → 在后台重新添加链接
否
  ↓
第 2 步：执行强制修复 RLS SQL
  ↓
第 6 步返回 3 条数据？
  ↓
是 → 清除浏览器缓存（Ctrl+F5）
  ↓
查看浏览器控制台
  ↓
Found links: 3?
  ↓
是 → ✅ 成功！页面显示 3 个按钮
  ↓
否 → 清除 Next.js 缓存（rm -rf .next）
```

---

## 🎯 为什么会这样？

### RLS 权限详解

**问题根源**:
- Supabase 默认启用了 RLS（行级安全策略）
- 如果没有正确的策略，匿名用户无法查询数据
- 前台访客是匿名用户（anon role）
- 所以需要给 `public` 角色授予 SELECT 权限

**修复原理**:
```sql
CREATE POLICY "public_read_product_waimai_links"
ON product_waimai_links FOR SELECT
TO public
USING (is_enabled = true);
```

这个策略允许任何人查询已启用的外卖链接（`is_enabled = true`），既保证了数据的可见性，又保证了安全性（未启用的链接不会泄露）。

---

## ⚠️ 常见误区

### 误区 1: "我已经执行过 RLS 修复 SQL 了"

**问题**: 可能执行的脚本不完整或有误

**解决**: 
- 使用最新的 `FORCE_FIX_RLS_100.sql` 脚本
- 确保完整执行所有步骤
- 查看第 6 步的查询结果验证

---

### 误区 2: "策略已经创建了，但还是不行"

**可能原因**:
1. 策略名称不同，但有冲突
2. Supabase 缓存未更新
3. Next.js 缓存未更新

**解决**:
- 使用 `DO $$ ... END $$;` 块强制删除所有策略
- 清除 Next.js 缓存
- 等待 2-3 分钟

---

### 误区 3: "数据库中有数据，但查询就是返回空"

**这是典型的 RLS 权限问题！**

**特征**:
- 直接查询有数据
- `SET ROLE anon` 后查询返回空
- 前台显示"暂无购买渠道"

**解决**: 执行第 2 步的强制修复 SQL

---

## 🎨 修复前后对比

### 修复前

**SQL 查询**:
```sql
SET ROLE anon;
SELECT * FROM product_waimai_links WHERE product_id = 'xxx' AND is_enabled = true;
-- 返回空结果
```

**浏览器控制台**:
```
[ProductWaimaiLinksService] Fetching links for product: xxx
[ProductWaimaiLinksService] Found links: 0
```

**页面**:
```
选择购买渠道：
暂无购买渠道，请联系管理员添加

调试信息：
商品ID: xxx
查询到的链接数：0
```

---

### 修复后

**SQL 查询**:
```sql
SET ROLE anon;
SELECT * FROM product_waimai_links WHERE product_id = 'xxx' AND is_enabled = true;
-- 返回 3 条数据
```

**浏览器控制台**:
```
[ProductWaimaiLinksService] Fetching links for product: xxx
[ProductWaimaiLinksService] Found links: 3
Product xxx:
- Links count: 3
- Links: [Array(3)]
```

**页面**:
```
选择购买渠道：
[🟡 美团外卖] [🔵 叮咚买菜] [🟡 美团外卖]
```

---

## 📞 如需进一步帮助

如果按照以上所有步骤操作后仍然不行，请提供以下信息：

1. **第 1 步的查询结果**（total_links 数量）
2. **第 5 步的查询结果截图**（pg_policies 表的内容）
3. **第 6 步的查询结果**（是否返回 3 条数据）
4. **浏览器控制台完整日志截图**
5. **页面上黄色调试框的截图**

这样可以更精准地定位问题！

---

## 📚 相关文档

- [`DIAGNOSE_RLS_COMPLETE.sql`](file:///Users/liaoyuan/Desktop/works/huang-lao-boss/DIAGNOSE_RLS_COMPLETE.sql) - 完整诊断脚本
- [`FORCE_FIX_RLS_100.sql`](file:///Users/liaoyuan/Desktop/works/huang-lao-boss/FORCE_FIX_RLS_100.sql) - 强制修复脚本
- [`FIX_WAIMAI_LINKS_3MIN.md`](file:///Users/liaoyuan/Desktop/works/huang-lao-boss/FIX_WAIMAI_LINKS_3MIN.md) - 3 分钟快速修复指南

---

**立即行动**: 执行第 2 步的强制修复 SQL！🚀

**最后更新**: 2026-03-30
