# Next.js 13 兼容性检查清单

## ✅ 已完成的配置

### 1. package.json
- ✅ `next`: 降级到 `13.5.6`
- ✅ `eslint-config-next`: 对齐到 `13.5.6`
- ✅ `engines.node`: 声明支持 `>=16.0.0`

### 2. next.config.js
- ✅ 移除 `serverActions` 配置（Next.js 14 专属）
- ✅ 添加 `experimental.appDir: true`（Next.js 13 需要显式启用 App Router）
- ✅ 保持其他配置不变

### 3. 代码检查

#### ❌ 未使用的功能（这些在 Next.js 13 中不可用）
- ✅ 没有使用 `'use server'` 指令
- ✅ 没有使用 `next/cache` API
- ✅ 没有使用 `cache()` 函数
- ✅ 没有使用 `unstable_cache()`

#### ✅ 已正确配置的功能
- ✅ 所有交互组件都添加了 `'use client'` 指令
- ✅ 服务端组件默认不使用客户端 hooks
- ✅ 布局文件正确使用 async/await
- ✅ metadata 生成使用正确的 API

### 4. 项目结构
```
src/
├── app/              # App Router (Next.js 13 实验性但稳定)
│   ├── layout.tsx    # 根布局
│   ├── page.tsx      # 首页
│   ├── admin/        # 后台管理
│   ├── products/     # 商品页面
│   └── ...
├── components/       # React 组件
│   ├── header.tsx    # 服务端组件
│   ├── footer.tsx    # 服务端组件
│   ├── ui/           # UI 基础组件
│   └── *.tsx         # 带 'use client' 的交互组件
└── lib/              # 工具库
```

---

## 📋 兼容性验证清单

### 构建测试
- [ ] `npm run build` 成功无错误
- [ ] 没有出现 "Server Actions" 相关错误
- [ ] App Router 正常工作
- [ ] 所有页面都能正常渲染

### 功能测试
- [ ] 首页加载正常
- [ ] SSR 页面正常渲染
- [ ] 静态生成（SSG）正常
- [ ] 动态路由正常
- [ ] API Routes 正常
- [ ] 图片优化正常
- [ ] CSS/Tailwind 正常

### 交互测试
- [ ] 客户端组件可以正常使用 hooks
- [ ] 表单提交正常
- [ ] 按钮点击事件正常
- [ ] 状态更新正常

---

## 🔧 Next.js 13 vs 14 主要差异处理

### 1. Server Actions（不支持）

**Next.js 14 写法：**
```tsx
// ❌ 这在 Next.js 13 中不工作
async function submitForm(data) {
  'use server'
  await db.insert(data)
}
```

**Next.js 13 替代方案：**
```tsx
// ✅ 使用 API Routes
// pages/api/submit.ts
export default async function handler(req, res) {
  await db.insert(req.body)
  res.json({ success: true })
}

// 客户端调用
fetch('/api/submit', { method: 'POST', body: data })
```

### 2. 缓存 API（不支持）

**Next.js 14 写法：**
```tsx
// ❌ 这在 Next.js 13 中不工作
import { cache } from 'next/cache'

const getData = cache(async () => {
  return fetch('...').then(r => r.json())
})
```

**Next.js 13 替代方案：**
```tsx
// ✅ 直接在 Server Component 中使用 async/await
async function Page() {
  const data = await fetch('...', { 
    cache: 'no-store' // 或 'force-cache'
  }).then(r => r.json())
  return <div>{data}</div>
}
```

### 3. App Router 配置

**Next.js 14：**
```javascript
// ✅ 默认启用，无需配置
module.exports = {
  // 不需要任何配置
}
```

**Next.js 13：**
```javascript
// ✅ 需要显式启用
module.exports = {
  experimental: {
    appDir: true,
  }
}
```

---

## 🎯 组件迁移指南

### 服务端组件（推荐默认使用）

```tsx
// ✅ 服务端组件 - 可以直接使用 async
async function ProductList() {
  const products = await getProducts()
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>
}
```

### 客户端组件（需要交互时）

```tsx
// ✅ 客户端组件 - 第一行必须是 'use client'
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### 混合使用

```tsx
// ✅ 服务端组件导入客户端组件
import { Counter } from './counter' // 'use client'

async function Page() {
  const data = await fetchData()
  return (
    <div>
      <h1>{data.title}</h1>
      <Counter /> {/* 客户端组件可以在服务端组件中使用 */}
    </div>
  )
}
```

---

## 📊 性能优化建议

### 1. 数据获取策略

```tsx
// ✅ 在服务端组件中直接获取数据
async function Page() {
  const data = await fetch('...', {
    cache: 'force-cache' // 默认，启用缓存
    // cache: 'no-store' // 每次请求都重新获取
  })
}
```

### 2. 流式渲染

```tsx
// ✅ 使用 Suspense 实现流式渲染
import { Suspense } from 'react'

async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SlowComponent />
    </Suspense>
  )
}
```

### 3. 图片优化

```tsx
// ✅ 使用 next/image
import Image from 'next/image'

<Image 
  src="/photo.jpg" 
  alt="描述"
  width={800}
  height={600}
  priority // 首屏图片添加 priority
/>
```

---

## 🐛 常见问题排查

### Q1: 遇到 "appDir is not a valid experiment" 错误？

**A**: 确保使用的是 Next.js 13.4+：
```bash
npm install next@13.5.6
```

### Q2: 客户端组件无法使用？

**A**: 确保组件第一行有 `'use client'`：
```tsx
'use client'  // 必须在第一行

export default function Component() {
  // ...
}
```

### Q3: 服务端组件无法使用 useState？

**A**: 将组件改为客户端组件或提取状态到子组件：
```tsx
// ❌ 错误
async function Page() {
  const [state, setState] = useState() // useState 不能在 async 组件中使用
}

// ✅ 正确
'use client'

export default function Page() {
  const [state, setState] = useState()
  return <div>...</div>
}
```

### Q4: 构建速度慢？

**A**: 可以尝试启用 Turbopack（开发环境）：
```bash
next dev --turbo
```

---

## ✅ 最终检查清单

部署前请确认：

- [ ] Node.js 版本 >= 16.0.0
- [ ] Next.js 版本 = 13.5.6
- [ ] `next.config.js` 包含 `experimental.appDir: true`
- [ ] 所有交互组件都有 `'use client'` 指令
- [ ] 没有使用 `'use server'`
- [ ] 没有使用 `next/cache`
- [ ] `npm run build` 成功
- [ ] 所有页面都能正常访问
- [ ] 功能测试通过

---

**最后更新**: 2026-04-01  
**适用版本**: Next.js 13.5.6
