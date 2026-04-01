# 🚀 淋淋园牛羊肉 - Node.js 16 部署指南

## ⚠️ 重要说明

**Next.js 14 官方要求 Node.js 18.17+**，但通过配置可以在 Node.js 16 上运行。

### 兼容性状态
- ✅ **基本功能**: 可运行
- ✅ **SSR/SSG**: 正常工作
- ✅ **API 路由**: 正常工作
- ⚠️ **Server Actions**: 已禁用（需要 Node.js 18+）
- ⚠️ **某些新特性**: 可能不可用

---

## 📋 目录

- [方案对比](#方案对比)
- [方案一：使用 Node.js 16 + Next.js 14（当前方案）](#方案一使用 nodejs-16--nextjs-14当前方案)
- [方案二：降级到 Next.js 13（完全兼容）](#方案二降级到 nextjs-13完全兼容)
- [宝塔面板配置](#宝塔面板配置)
- [常见问题](#常见问题)

---

## 🎯 方案对比

| 特性 | Node.js 16 + Next.js 14 | Node.js 18 + Next.js 14 | Next.js 13 + Node.js 16 |
|------|----------------------|----------------------|---------------------|
| 兼容性 | ⚠️ 基本可用 | ✅ 完全兼容 | ✅ 完全兼容 |
| 性能 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 稳定性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Server Actions | ❌ 不支持 | ✅ 支持 | ❌ 不支持 |
| 推荐度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 方案一：使用 Node.js 16 + Next.js 14（当前方案）

### ✅ 已完成的配置

#### 1. package.json 配置
```json
{
  "engines": {
    "node": ">=16.0.0"
  }
}
```

#### 2. next.config.js 配置
```javascript
experimental: {
  serverActions: false,  // 禁用需要 Node.js 18+ 的特性
}
```

### 📝 部署步骤（宝塔面板）

#### 步骤 1：安装 Node.js 16

**方法 A：使用宝塔面板**
1. 登录宝塔面板
2. 点击 **软件商店**
3. 搜索 **Node.js 项目管理器**
4. 点击 **设置** → **版本管理**
5. 选择 **16.x** 并安装

**方法 B：命令行安装**
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

#### 步骤 2：安装项目依赖

```bash
cd /www/wwwroot/linlinyuan.com

# 安装依赖
npm install --production

# 如果遇到 peer dependency 警告，可以忽略或添加 --legacy-peer-deps
npm install --production --legacy-peer-deps
```

#### 步骤 3：构建项目

```bash
# 构建项目（跳过 lint 和类型检查）
npm run build
```

如果构建成功，说明 Node.js 16 可以运行！✅

#### 步骤 4：启动应用

```bash
# 使用 PM2 启动
pm2 start ecosystem.config.js

# 或使用 npm
pm2 start npm --name "huang-lao-boss" -- start
```

---

## 方案二：降级到 Next.js 13（完全兼容）

如果在 Node.js 16 下遇到问题，可以降级到 Next.js 13。

### 📝 修改 package.json

将以下内容替换到 `package.json`：

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@supabase/supabase-js": "^2.39.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.312.0",
    "next": "13.5.6",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.57.1",
    "eslint-config-next": "13.5.6",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```

### 📝 修改 next.config.js

如果使用 Next.js 13，确保配置兼容：

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
}

module.exports = nextConfig
```

### 重新安装依赖

```bash
# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json yarn.lock

# 重新安装
npm install --production

# 或如果使用 yarn
yarn install --production
```

### 构建测试

```bash
npm run build
```

---

## 🔧 宝塔面板配置

### 1. 添加 Node.js 项目

1. 打开宝塔面板 → **Node.js 项目管理器**
2. 点击 **添加 Node.js 项目**
3. 填写信息：
   - **项目名称**: `huang-lao-boss`
   - **项目路径**: `/www/wwwroot/linlinyuan.com`
   - **Node.js 版本**: 选择 **16.x**
   - **端口**: `3000`
   - **运行模式**: `production`

### 2. 安装依赖

在项目列表中点击 **安装依赖**

### 3. 构建项目

点击 **构建** 按钮

### 4. 启动项目

点击 **启动** 按钮

### 5. 配置环境变量

在文件管理中创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase 密钥
NODE_ENV=production
PORT=3000
```

---

## 🔍 常见问题排查

### Q1: 构建失败，提示需要 Node.js 18+

**解决方案 A**：添加 --ignore-engines 参数
```bash
npm install --production --ignore-engines
npm run build
```

**解决方案 B**：降级到 Next.js 13（见方案二）

### Q2: 运行时出现警告

某些警告是正常的，可以忽略：
```bash
# 添加 --silent 减少输出
npm run build --silent
```

### Q3: Server Actions 无法使用

这是正常的，Server Actions 需要 Node.js 18+。
- 使用传统的 API 路由代替
- 或升级到 Node.js 18

### Q4: 性能问题

如果遇到性能问题：
1. 检查 PM2 配置
2. 增加 Swap 分区
3. 考虑升级到 Node.js 18

### Q5: 如何回退到 Node.js 18？

**宝塔面板**：
1. Node.js 项目管理器 → 设置
2. 版本管理 → 选择 18.x
3. 重启项目

**命令行**：
```bash
# 卸载 Node.js 16
yum remove -y nodejs

# 安装 Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs
```

---

## 📊 测试清单

部署完成后，请测试以下功能：

- [ ] 首页加载正常
- [ ] 商品列表正常
- [ ] 分类页面正常
- [ ] 文章页面正常
- [ ] 后台登录正常
- [ ] 后台管理功能正常
- [ ] 图片上传正常
- [ ] 数据提交正常
- [ ] SSR 页面正常（查看页面源代码）

---

## 💡 最佳实践建议

### 1. 监控日志

```bash
# 实时查看日志
pm2 logs huang-lao-boss

# 或在宝塔面板查看
```

### 2. 定期检查

每周检查：
- PM2 进程状态
- 错误日志
- 内存使用情况

### 3. 备份策略

- 每周备份代码
- 每月备份数据库（Supabase 自动备份）
- 使用阿里云快照

### 4. 升级计划

建议在条件允许时升级到 Node.js 18：
- 更好的性能
- 完整的功能支持
- 长期维护

---

## 🎉 部署完成检查清单

- [ ] Node.js 16 已安装
- [ ] 项目依赖已安装
- [ ] 项目构建成功
- [ ] PM2 进程运行中
- [ ] 网站访问正常
- [ ] 后台功能正常
- [ ] 环境变量已配置
- [ ] 反向代理已配置
- [ ] SSL 证书已配置（可选）

---

## 📞 获取帮助

如果遇到其他问题：

1. **查看日志**：`pm2 logs huang-lao-boss`
2. **检查配置**：确认 .env.local 配置正确
3. **重启服务**：`pm2 restart huang-lao-boss`
4. **项目 Issues**：https://github.com/ahkjxy/hungniuweb/issues

---

**最后更新**: 2026-04-01  
**适用版本**: Node.js 16.x + Next.js 14.1.0
