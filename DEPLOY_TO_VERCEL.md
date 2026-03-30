# 🚀 Vercel 部署指南

## 📋 部署前准备

### 1. 环境检查

**已满足的条件**:
- ✅ Next.js 14.1.0 (Vercel 完美支持)
- ✅ 使用 App Router
- ✅ TypeScript 项目
- ✅ 已有 `package.json` 和构建脚本

**需要配置的内容**:
- ⚠️ Supabase 环境变量
- ⚠️ 其他环境配置

---

## 🎯 快速部署（推荐方式）

### 方法 1: Vercel CLI 部署（最快）

#### 第 1 步：安装 Vercel CLI

```bash
npm install -g vercel
```

#### 第 2 步：登录 Vercel

```bash
vercel login
```

选择你的登录方式（GitHub/GitLab/Email）

#### 第 3 步：首次部署

```bash
vercel
```

按照提示操作：
1. **Set up and deploy?** → `Y`
2. **Which scope?** → 选择你的账号
3. **Link to existing project?** → `N` (首次部署)
4. **What's your project's name?** → `huang-lao-boss` (或自定义)
5. **In which directory is your code located?** → `./`
6. **Want to override the settings?** → `N`

#### 第 4 步：配置环境变量

**重要！** 需要在 Vercel 后台添加环境变量：

1. 访问 [vercel.com](https://vercel.com)
2. 进入你的项目
3. 点击 **Settings** → **Environment Variables**
4. 添加以下变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://bgpeyfvgqpgsezgzqrco.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_N3tR08CEY_iXD8HcgnM-9Q_YTUfdECP
NEXT_PUBLIC_SITE_NAME=淋淋园牛羊肉
```

#### 第 5 步：重新部署

添加环境变量后，重新部署：

```bash
vercel --prod
```

---

### 方法 2: GitHub 集成部署（最常用）

#### 第 1 步：推送到 GitHub

```bash
# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit - ready for Vercel"

# 创建 GitHub 仓库并推送
git remote add origin https://github.com/your-username/huang-lao-boss.git
git branch -M main
git push -u origin main
```

#### 第 2 步：在 Vercel 导入项目

1. **访问** [vercel.com/new](https://vercel.com/new)
2. **点击** "Import Git Repository"
3. **选择** 你的 GitHub 仓库 `huang-lao-boss`
4. **点击** "Import Project"

#### 第 3 步：配置项目

**Framework Preset**: Next.js (自动识别)  
**Root Directory**: `./` (默认)  
**Build Command**: `next build` (默认)  
**Output Directory**: `.next` (默认)

#### 第 4 步：添加环境变量

在 Vercel 项目设置中添加：

```
NEXT_PUBLIC_SUPABASE_URL=https://bgpeyfvgqpgsezgzqrco.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_N3tR08CEY_iXD8HcgnM-9Q_YTUfdECP
NEXT_PUBLIC_SITE_NAME=淋淋园牛羊肉
```

#### 第 5 步：部署

点击 **"Deploy"**

等待几分钟后，你的网站就会上线！

---

## 🔧 详细配置说明

### 环境变量配置

#### 必须配置的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bgpeyfvgqpgsezgzqrco.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_N3tR08CEY_iXD8HcgnM-9Q_YTUfdECP` | Supabase 匿名密钥 |
| `NEXT_PUBLIC_SITE_NAME` | `淋淋园牛羊肉` | 网站名称 |

#### 可选配置的环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `NEXT_PUBLIC_WECHAT_MINIPROGRAM_URL` | `https://your-wechat-miniprogram.com` | 微信小程序链接 |
| `NEXT_PUBLIC_MEITUAN_URL` | `https://meituan.com/your-store` | 美团店铺链接 |
| `NEXT_PUBLIC_ELEME_URL` | `https://ele.me/your-store` | 饿了么店铺链接 |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | 生产环境域名 |

---

### Vercel 配置文件（可选）

如果需要更精细的控制，可以创建 `vercel.json`：

```json
{
  "framework": "nextjs",
  "regions": ["hnd1"],  // 亚洲地区，更快的访问速度
  "env": {
    "NEXT_PUBLIC_SITE_NAME": "淋淋园牛羊肉"
  },
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "devCommand": "next dev",
  "installCommand": "npm install"
}
```

---

## 🎨 部署后的优化

### 1. 绑定自定义域名

1. 访问 Vercel 项目 → **Settings** → **Domains**
2. 添加你的域名（例如：`huanglaoban.com`）
3. 按照提示配置 DNS

**DNS 配置示例**:
```
类型：A
主机记录：@
记录值：76.76.21.21
```

或 CNAME：
```
类型：CNAME
主机记录：www
记录值：cname.vercel-dns.com
```

---

### 2. 配置预览部署

Vercel 会自动为每个分支创建预览部署：

```bash
# 创建功能分支
git checkout -b feature/new-design

# 推送到 GitHub
git push origin feature/new-design

# Vercel 会自动创建预览链接
# 例如：https://huang-lao-boss-git-feature-new-design.vercel.app
```

---

### 3. 生产环境部署

```bash
# 切换到主分支
git checkout main

# 推送到生产环境
git push origin main

# Vercel 会自动部署到生产环境
# 例如：https://huang-lao-boss.vercel.app
```

---

## 🔍 故障排查

### 问题 1: 构建失败

**错误信息**: `Error: Environment variable not found`

**解决方案**:
1. 检查 Vercel 环境变量是否配置完整
2. 确保所有 `NEXT_PUBLIC_` 开头的变量都已添加
3. 重新部署项目

---

### 问题 2: Supabase 连接失败

**错误信息**: `Invalid API key` 或 `Network Error`

**解决方案**:
1. 检查 Supabase URL 是否正确
2. 检查 Anon Key 是否正确
3. 确认 Supabase 项目的 RLS 策略已正确配置
4. 检查 Supabase 是否允许来自 Vercel 的请求

**测试 Supabase 连接**:
```bash
# 在 Vercel 部署后，访问网站
# 查看浏览器控制台的错误信息
```

---

### 问题 3: 图片无法显示

**原因**: 可能使用了本地路径或权限问题

**解决方案**:
1. 确保图片使用完整的 URL
2. 检查 Supabase Storage 的公开访问权限
3. 在 `next.config.js` 中配置图片域名：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['bgpeyfvgqpgsezgzqrco.supabase.co'],
  },
}

module.exports = nextConfig
```

---

### 问题 4: SEO 不生效

**原因**: 动态内容未正确渲染

**解决方案**:
1. 确保使用 `force-dynamic` 的页面正确配置
2. 检查 Server Components 的数据获取逻辑
3. 使用 Vercel 的 Build Logs 查看是否有错误

---

## 📊 性能优化建议

### 1. 启用边缘缓存

在需要实时数据的页面保持 `force-dynamic`，在其他页面使用 ISR：

```typescript
// 商品列表页 - 使用 ISR（每 60 秒更新）
export const revalidate = 60

// 商品详情页 - 保持动态
export const dynamic = 'force-dynamic'
```

---

### 2. 优化图片加载

```typescript
<Image
  src={imageUrl}
  alt={title}
  width={800}
  height={600}
  priority={true}  // 首屏图片优先加载
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

---

### 3. 减少包体积

```bash
# 分析包体积
npm run build

# 查看哪些依赖占用空间最大
npx next-bundle-analyzer
```

---

## 🎯 部署检查清单

### 部署前检查

- [ ] 代码已推送到 GitHub
- [ ] 所有环境变量已配置
- [ ] Supabase RLS 策略已正确设置
- [ ] 本地测试通过
- [ ] 没有硬编码的敏感信息

### 部署后验证

- [ ] 网站首页正常加载
- [ ] 商品列表正常显示
- [ ] 商品详情正常显示
- [ ] 外卖平台链接正常
- [ ] 后台管理可以访问
- [ ] 登录功能正常
- [ ] 图片正常显示
- [ ] SEO 信息正确

### 性能检查

- [ ] 首屏加载时间 < 3 秒
- [ ] Lighthouse 分数 > 90
- [ ] 移动端适配良好
- [ ] 无控制台错误

---

## 🚀 一键部署脚本

创建一个快速部署脚本 `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 开始部署到 Vercel..."

# 1. 检查 Git 状态
git status
read -p "继续部署？(y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo "❌ 部署已取消"
  exit 1
fi

# 2. 提交更改
git add .
git commit -m "Deploy to Vercel $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

# 3. 部署到 Vercel
vercel --prod

echo "✅ 部署完成！"
echo "🌐 访问地址：https://huang-lao-boss.vercel.app"
```

使用方法：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📞 获取帮助

### Vercel 官方文档
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)

### Supabase 相关
- [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎉 部署成功标志

部署成功后，你应该能够：

1. ✅ 访问 `https://huang-lao-boss.vercel.app`
2. ✅ 看到网站首页正常显示
3. ✅ 所有功能正常工作
4. ✅ 在 Vercel Dashboard 看到部署状态为 "Ready"

---

**最后更新**: 2026-03-30  
**项目版本**: 1.0.0  
**框架**: Next.js 14.1.0
