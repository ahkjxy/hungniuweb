# 🚀 淋淋园牛羊肉 - Next.js 13 + Node.js 16 部署指南

## ✅ 版本信息

- **Next.js**: 13.5.6（完全兼容 Node.js 16）
- **Node.js**: >=16.0.0
- **React**: 18.2.0
- **TypeScript**: 5.3.3
- **App Router**: ✅ 已启用（通过 experimental.appDir）

---

## 🎯 为什么选择 Next.js 13？

### 优势
- ✅ **完全兼容 Node.js 16** - 无需升级到 Node.js 18
- ✅ **稳定性高** - 经过长期验证，生产环境广泛使用
- ✅ **功能完整** - 支持 SSR、SSG、API Routes、App Router 等所有核心功能
- ✅ **性能优秀** - 自动代码分割、图片优化等
- ✅ **App Router 支持** - 使用最新的文件路由系统

### 与 Next.js 14 的区别
| 特性 | Next.js 13 | Next.js 14 |
|------|-----------|-----------|
| Node.js 要求 | 16.0+ | 18.17+ |
| Server Actions | ❌ 不支持 | ✅ 支持 |
| App Router | ✅ 实验性但稳定 | ✅ 默认启用 |
| Turbopack | ⚠️ 实验性 | ✅ 稳定 |
| 稳定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**结论**：对于不需要 Server Actions 的项目，Next.js 13 是更稳定的选择。

---

## 🔧 Next.js 13 特殊配置

### next.config.js 配置

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  output: 'standalone',
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 在 Next.js 13 中启用 App Router
  experimental: {
    appDir: true,
  }
}

module.exports = nextConfig
```

**重要**：Next.js 13 需要显式启用 `appDir` 才能使用 App Router。

### 组件指令

#### 客户端组件（需要交互）
```tsx
'use client'

import { useState } from 'react'

export default function MyComponent() {
  // 可以使用 hooks 和事件处理
}
```

#### 服务端组件（默认，纯展示）
```tsx
// 不需要 'use client'
// 可以直接使用 async/await

export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

## 📋 部署方式

### 方式一：宝塔面板部署（推荐）

#### 1️⃣ 安装 Node.js 16

**使用宝塔面板：**
1. 登录宝塔面板：`http://你的服务器 IP:8888`
2. 点击 **软件商店**
3. 搜索 **Node.js 项目管理器**
4. 点击 **设置** → **版本管理**
5. 选择 **16.x** 并安装

**或使用命令行：**
```bash
# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs

# 验证版本
node -v  # 应该显示 v16.x.x
npm -v
```

#### 2️⃣ 准备项目代码

**方法 A：Git 克隆**
```bash
cd /www/wwwroot/linlinyuan.com
git clone https://github.com/ahkjxy/hungniuweb.git .
```

**方法 B：上传压缩包**
1. 本地打包项目
2. 宝塔面板 → 文件 → 上传
3. 解压到 `/www/wwwroot/linlinyuan.com`

#### 3️⃣ 配置环境变量

创建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase 密钥
NODE_ENV=production
PORT=3000
```

#### 4️⃣ 使用 Node.js 项目管理器

1. 点击左侧 **Node.js 项目管理器**
2. 点击 **添加 Node.js 项目**
3. 填写信息：
   - **项目名称**: `huang-lao-boss`
   - **项目路径**: `/www/wwwroot/linlinyuan.com`
   - **Node.js 版本**: 16.x
   - **端口**: 3000
   - **运行模式**: production

4. 在项目列表中操作：
   - 点击 **安装依赖**
   - 点击 **构建**
   - 点击 **启动**
   - 打开 **开机自启**

#### 5️⃣ 配置反向代理

1. 点击左侧 **网站**
2. 找到你的网站，点击 **设置**
3. 点击 **反向代理** → **添加反向代理**
4. 填写：
   - **代理名称**: `huang-lao-boss`
   - **目标 URL**: `http://127.0.0.1:3000`
   - **发送域名**: `$host`

5. 点击 **提交**

#### 6️⃣ 申请 SSL 证书

1. 在网站设置页面点击 **SSL**
2. 选择 **Let's Encrypt**
3. 填写邮箱，勾选域名
4. 点击 **申请**
5. 申请成功后打开 **强制 HTTPS**

---

### 方式二：PM2 命令行部署

#### 1️⃣ 安装依赖

```bash
cd /www/wwwroot/linlinyuan.com

# 安装项目依赖
npm install --production

# 或忽略引擎检查
npm install --production --ignore-engines
```

#### 2️⃣ 构建项目

```bash
# 构建（跳过 lint 和类型检查）
npm run build
```

#### 3️⃣ 配置 PM2

确保 `ecosystem.config.js` 存在：
```javascript
module.exports = {
  apps: [{
    name: 'huang-lao-boss',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    autorestart: true,
    max_memory_restart: '512M',
  }]
}
```

#### 4️⃣ 启动应用

```bash
# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 保存配置
pm2 save

# 配置开机自启
pm2 startup
# 执行输出的命令
```

---

## 🔍 验证部署

### 检查清单

- [ ] Node.js 版本正确（v16.x）
- [ ] 项目依赖已安装
- [ ] 构建成功无错误
- [ ] PM2 进程运行中
- [ ] 可以访问 http://localhost:3000
- [ ] 反向代理配置正确
- [ ] 网站正常访问

### 测试命令

```bash
# 查看 Node.js 版本
node -v

# 查看 PM2 进程
pm2 status

# 查看日志
pm2 logs huang-lao-boss

# 测试本地访问
curl http://localhost:3000

# 查看端口占用
netstat -tlnp | grep 3000
```

---

## 🆚 与 Next.js 14 的差异处理

### 已移除的功能

#### 1. Server Actions（不可用）

Next.js 14 的 Server Actions 在 Next.js 13 中不可用。

**替代方案：**
- 使用 API Routes（`/pages/api/*`）
- 使用传统的表单提交方式

#### 2. Turbopack（实验性）

Next.js 13 中 Turbopack 是实验性的。

**建议：**
- 继续使用 Webpack（默认）
- 保持稳定的开发体验

### 配置差异

#### next.config.js

Next.js 13 的配置更简单，不需要 experimental 配置：

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  output: 'standalone',
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
```

---

## 🔧 常见问题

### Q1: 构建时出现 peer dependency 警告？

**A**: 这是正常的，可以忽略：
```bash
# 或使用 legacy-peer-deps
npm install --production --legacy-peer-deps
```

### Q2: 如何回退到 Next.js 14？

**A**: 修改 package.json：
```json
{
  "dependencies": {
    "next": "14.1.0",
    "eslint-config-next": "^14.1.0"
  }
}
```

然后重新安装：
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Q3: 性能不如 Next.js 14？

**A**: 
1. 检查是否开启了 production 模式
2. 确认 PM2 配置正确
3. 考虑增加服务器资源

### Q4: 图片优化不工作？

**A**: 检查 `next.config.js` 中的 images 配置：
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
}
```

### Q5: 如何更新代码？

**A**:
```bash
cd /www/wwwroot/linlinyuan.com
git pull
npm install
npm run build
pm2 restart huang-lao-boss
```

---

## 📊 性能优化建议

### 1. 启用 Gzip 压缩

在 Nginx 配置中添加：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 2. 配置缓存

静态资源缓存：
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用 CDN

将静态资源上传到阿里云 OSS 或其他 CDN 服务。

### 4. 数据库优化

- 使用 Supabase 的连接池
- 添加适当的索引
- 启用查询缓存

---

## 💡 最佳实践

### 1. 定期更新依赖

每月检查一次依赖更新：
```bash
npm outdated
npm update
```

### 2. 监控和日志

- 使用 PM2 Monitor
- 配置错误告警
- 定期查看日志

### 3. 备份策略

- 每周备份代码
- 使用阿里云快照
- Supabase 自动备份

### 4. 安全加固

- 定期更新系统补丁
- 配置防火墙
- 使用强密码

---

## 🎉 部署完成检查清单

- [ ] Node.js 16 已安装并验证
- [ ] 项目代码已上传
- [ ] 环境变量已配置
- [ ] 依赖已安装完成
- [ ] 项目构建成功
- [ ] PM2 进程运行正常
- [ ] 反向代理已配置
- [ ] 网站可以正常访问
- [ ] SSL 证书已配置（可选）
- [ ] 开机自启已配置

---

## 📞 获取帮助

- **官方文档**: https://nextjs.org/docs
- **项目 Issues**: https://github.com/ahkjxy/hungniuweb/issues
- **宝塔论坛**: https://www.bt.cn/bbs/

---

**最后更新**: 2026-04-01  
**适用版本**: Next.js 13.5.6 + Node.js 16.x
