# ⚡️ 3 分钟紧急修复：外卖链接不显示

## 📋 问题现状

**后台**: ✅ 已添加 3 个外卖平台链接（美团外卖、叮咚买菜、美团外卖）  
**前台**: ❌ 仍然显示"暂无购买渠道"

**原因**: **RLS 权限阻止了匿名用户查询数据**

---

## 🚀 立即修复（2 分钟）

### 第 1 步：在 Supabase SQL Editor 执行以下 SQL

打开 [Supabase Dashboard](https://supabase.com) → 你的项目 → SQL Editor

复制并执行：

```sql
-- ========================================
-- ⚡️ 删除所有旧策略
-- ========================================
DROP POLICY IF EXISTS "Allow authenticated users to read product waimai links" ON product_waimai_links;
DROP POLICY IF EXISTS "Allow public read access for product waimai links" ON product_waimai_links;
DROP POLICY IF EXISTS "Enable read access for all users" ON product_waimai_links;

-- ========================================
-- ⚡️ 创建新的公开读取策略（关键！）
-- ========================================
CREATE POLICY "Allow public read access for product waimai links"
ON product_waimai_links FOR SELECT
TO public
USING (is_enabled = true);
```

**点击 Run 按钮执行！**

---

### 第 2 步：验证策略已创建

继续在 SQL Editor 执行：

```sql
SELECT 
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'product_waimai_links';
```

**应该看到**:
```
policyname: "Allow public read access for product waimai links"
roles: public
cmd: SELECT
```

---

### 第 3 步：测试查询

继续执行：

```sql
SET ROLE anon;

SELECT 
  platform_name,
  shop_url
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true;
```

**应该返回 3 条数据**:
```
platform_name | shop_url
--------------|------------------
美团外卖       | http://...
叮咚买菜       | http://...
美团外卖       | https://...
```

**如果返回 3 条数据** → ✅ RLS 已修复！

---

## ✅ 验证前台显示

### 方法 1: 刷新页面

1. 访问 `/product/a6e3c709-ff3d-418e-a637-1b5217189a17`
2. **按 Ctrl+F5** 强制刷新（清除缓存）
3. 查看"选择购买渠道"区域

**应该看到**:
```
选择购买渠道：
[🟡 美团外卖] [🔵 叮咚买菜] [🟡 美团外卖]
```

---

### 方法 2: 查看浏览器控制台

按 F12 打开开发者工具，查看 Console：

**应该看到**:
```
[ProductWaimaiLinksService] Fetching links for product: a6e3c709-ff3d-418e-a637-1b5217189a17
[ProductWaimaiLinksService] Found links: 3
Product a6e3c709-ff3d-418e-a637-1b5217189a17:
- Links count: 3
- Links: [Array(3)]
```

**如果还是 Found links: 0** → 继续往下看...

---

## 🔧 如果修复后还是不行

### 方案 A: 清除 Next.js 缓存

```bash
# 停止开发服务器（Ctrl+C）

# 删除 .next 文件夹
rm -rf .next

# 重新启动
npm run dev
```

然后刷新商品页面。

---

### 方案 B: 检查 TypeScript 类型

如果控制台报错：
```
Type '{ categories: ... }' has no property 'product_waimai_links'
```

**解决**:
```bash
# 生成 TypeScript 类型定义
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

然后重启开发服务器。

---

### 方案 C: 检查数据库连接

在终端查看是否有 Supabase 连接错误：

```bash
# 检查 .env.local 文件
cat .env.local

# 应该包含:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📊 完整诊断流程

```
开始
  ↓
执行 RLS 修复 SQL
  ↓
验证策略已创建
  ↓
测试查询返回 3 条数据？
  ↓
是 → 清除浏览器缓存（Ctrl+F5）
  ↓
查看浏览器控制台
  ↓
Found links: 3?
  ↓
是 → ✅ 成功！页面应该显示 3 个按钮
  ↓
否 → 执行方案 A（清除 Next.js 缓存）
```

---

## 🎯 为什么会这样？

### RLS 权限说明

**之前**（可能）:
```sql
-- 只允许认证用户读取
CREATE POLICY "..." ON product_waimai_links
FOR SELECT TO authenticated
USING (true);
```

**问题**:
- 前台访客是 **匿名用户（anon role）**
- 不是 **authenticated** 角色
- 所以查询被拒绝，返回空数组

**修复后**:
```sql
-- 允许所有人读取已启用的链接
CREATE POLICY "Allow public read access for product waimai links"
ON product_waimai_links FOR SELECT
TO public
USING (is_enabled = true);
```

**优点**:
- ✅ 任何人都可以查看已启用的链接
- ✅ 未启用的链接不会泄露（安全）
- ✅ 管理员操作不受影响（通过其他策略）

---

## ⚠️ 安全性说明

**问**: 允许 `public` 读取是否安全？

**答**: ✅ **完全安全！**

**原因**:
1. 只能读取 `is_enabled = true` 的数据（已公开的）
2. 管理员的 INSERT/UPDATE/DELETE 操作由其他策略控制
3. 店铺链接本来就是公开的 URL

**最佳实践**:
- ✅ SELECT 策略给 `public` + `is_enabled = true` 条件
- ✅ INSERT/UPDATE/DELETE 策略限制给 `authenticated`
- ❌ 不要给 `public` 写权限

---

## 🎨 修复前后对比

### 修复前

**控制台**:
```
[ProductWaimaiLinksService] Fetching links for product: xxx
[ProductWaimaiLinksService] Found links: 0
```

**页面**:
```
选择购买渠道：
暂无购买渠道，请联系管理员添加

调试信息：
商品ID: a6e3c709-ff3d-418e-a637-1b5217189a17
查询到的链接数：0
```

---

### 修复后

**控制台**:
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

如果按照以上步骤操作后仍然不行，请提供：

1. **第 2 步的查询结果截图**（pg_policies 表的内容）
2. **第 3 步的查询结果**（是否返回 3 条数据）
3. **浏览器控制台完整日志**
4. **页面上黄色调试框的截图**

这样可以更快定位问题！

---

**立即行动**: 执行第 1 步的 SQL 脚本！🚀

**最后更新**: 2026-03-30
