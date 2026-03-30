# 🔧 RLS 权限问题导致外卖链接不显示

## 📋 问题诊断

**现象**: 
- ✅ 后台已经添加了外卖平台链接
- ❌ 前台显示"暂无购买渠道，请联系管理员添加"
- ❌ 控制台可能报错或查询返回空数组

**根本原因**: 
**RLS（Row Level Security）策略阻止了匿名用户读取数据**

---

## 🎯 解决方案

### 方案 1: 执行 SQL 修复（推荐）⭐⭐⭐⭐⭐

在 **Supabase SQL Editor** 中执行以下 SQL：

```sql
-- ========================================
-- 修复商品外卖平台链接表的 RLS 权限
-- ========================================

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
```

**执行步骤**:
1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 复制上面的 SQL 并执行
4. 查看第 4 步的查询结果，应该看到新创建的策略

**预期结果**:
```
policyname: "Allow public read access for product waimai links"
roles: public
cmd: SELECT
qual: (is_enabled = true)
```

---

### 方案 2: 通过界面检查 RLS

如果不想用 SQL，也可以通过界面操作：

**步骤**:

1. **访问 Supabase Dashboard**
2. **进入 Authentication → Policies**
3. **找到 `product_waimai_links` 表**
4. **检查是否有 SELECT 策略**

**如果没有或策略不正确**:
5. 点击 "New Policy"
6. 选择 "Create a policy from scratch"
7. 填写:
   - Policy name: `Allow public read access for product waimai links`
   - Policy type: `SELECT`
   - Target roles: 勾选 `public`
   - USING expression: `is_enabled = true`
8. 点击 "Review" 然后 "Save policy"

---

## 🔍 为什么会这样？

### RLS 工作原理

```
用户请求 → Supabase 检查 RLS 策略 → 允许/拒绝访问
```

**之前的策略**（可能）:
```sql
-- 只允许认证用户读取
CREATE POLICY "..." ON product_waimai_links
FOR SELECT TO authenticated
USING (true);
```

**问题**:
- 前台访客是 **匿名用户（anon role）**
- 不是 **authenticated** 角色
- 所以被 RLS 拒绝了

**修复后的策略**:
```sql
-- 允许所有人读取已启用的链接
CREATE POLICY "..." ON product_waimai_links
FOR SELECT TO public
USING (is_enabled = true);
```

**优点**:
- ✅ 任何人都可以查看已启用的链接
- ✅ 未启用的链接不会泄露（安全）
- ✅ 管理员仍然可以管理（通过其他策略）

---

## ✅ 验证修复

### 方法 1: 测试查询

在 Supabase SQL Editor 执行：

```sql
-- 以匿名角色测试
SET ROLE anon;

-- 查询已启用的链接
SELECT 
  platform_name,
  shop_url
FROM product_waimai_links
WHERE product_id = 'a6e3c709-ff3d-418e-a637-1b5217189a17'
  AND is_enabled = true;
```

**如果返回数据** → ✅ RLS 已修复

**如果返回空或报错** → ❌ 还需要检查

---

### 方法 2: 查看浏览器控制台

1. **打开商品详情页** `/product/a6e3c709-ff3d-418e-a637-1b5217189a17`
2. **打开开发者工具**（F12）
3. **查看 Console**

**应该看到**:
```
[ProductWaimaiLinksService] Fetching links for product: a6e3c709-ff3d-418e-a637-1b5217189a17
[ProductWaimaiLinksService] Found links: 2
Product a6e3c709-ff3d-418e-a637-1b5217189a17:
- Links count: 2
- Links: [Array(2)]
```

**如果还是 0 条**:
- 检查控制台是否有错误
- 回到方案 1 重新执行 SQL

---

### 方法 3: 使用 Supabase 调试工具

在 Supabase Dashboard:
1. **进入 Database → Query Builder**
2. **选择 `product_waimai_links` 表**
3. **添加筛选**: `is_enabled = true` 和 `product_id = xxx`
4. **运行查询**

**如果能看到数据** → 数据库正常，是 RLS 问题
**如果看不到数据** → 数据库中就没有数据

---

## 🐛 其他可能的问题

### 问题 1: TypeScript 类型定义缺失

**错误信息**:
```
Type '{ categories: ... }' has no property 'product_waimai_links'
```

**原因**: `database.types.ts` 文件没有更新

**解决**: 

**方法 A: 自动生成（推荐）**
```bash
# 使用 Supabase CLI
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

**方法 B: 手动添加**
```typescript
// 在 database.types.ts 中添加
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      // ... 其他表
      product_waimai_links: {
        Row: {
          id: string
          product_id: string
          platform_key: string
          platform_name: string
          platform_icon: string | null
          shop_url: string
          product_url: string | null
          is_enabled: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          platform_key: string
          platform_name: string
          platform_icon?: string | null
          shop_url: string
          product_url?: string | null
          is_enabled?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          platform_key?: string
          platform_name?: string
          platform_icon?: string | null
          shop_url?: string
          product_url?: string | null
          is_enabled?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
```

---

### 问题 2: 缓存问题

**症状**: RLS 已修复，但前台还是不显示

**解决**:
```bash
# 停止开发服务器
# 删除 .next 文件夹
rm -rf .next

# 重新启动
npm run dev
```

**或者在浏览器**:
- Ctrl+Shift+Delete 清除缓存
- 或使用无痕模式测试

---

## 📊 完整诊断流程

```
1. 检查后台是否有数据
   ↓ 有
2. 执行 SQL 查询测试
   SELECT * FROM product_waimai_links WHERE product_id = 'xxx' AND is_enabled = true;
   ↓ 有数据
3. 检查 RLS 策略
   SELECT * FROM pg_policies WHERE tablename = 'product_waimai_links';
   ↓ 没有公开读取策略
4. 执行修复 SQL（方案 1）
   ↓
5. 刷新前台页面
   ↓
6. 查看浏览器控制台日志
   ↓ 显示 "Found links: 2"
7. ✅ 成功！
```

---

## 🎨 修复后的效果

### 之前（RLS 错误）

```
控制台：
[ProductWaimaiLinksService] Fetching links for product: xxx
[ProductWaimaiLinksService] Error fetching links: {message: "permission denied"}

页面：
暂无购买渠道，请联系管理员添加
```

### 修复后（RLS 正确）

```
控制台：
[ProductWaimaiLinksService] Fetching links for product: xxx
[ProductWaimaiLinksService] Found links: 2
Product xxx:
- Links count: 2
- Links: [{platform_name: "美团外卖", ...}, {...}]

页面：
选择购买渠道：
[🟡 美团外卖] [🔵 饿了么]
```

---

## ⚠️ 重要提示

### 安全性

**问题**: 允许 `public` 读取是否安全？

**答案**: ✅ 安全！

**原因**:
1. 只能读取 `is_enabled = true` 的数据
2. 管理员操作需要 authentication（通过其他策略控制）
3. 店铺链接本来就是公开的 URL

**最佳实践**:
- ✅ SELECT 策略给 `public` + `is_enabled = true` 条件
- ✅ INSERT/UPDATE/DELETE 策略限制给 `authenticated`
- ❌ 不要给 `public` 写权限

---

## 📞 如需帮助

如果执行修复 SQL 后仍然不行，请提供：

1. **RLS 策略查询结果**（第 4 步的截图）
2. **浏览器控制台完整日志**
3. **Supabase 项目 URL**（可选，用于远程诊断）

---

**最后更新**: 2026-03-30
