# 🚀 淋淋园牛羊肉 - PM2 部署指南

本指南将帮助你在服务器上部署项目，使用 PM2 进行进程管理。

## 📋 目录

- [部署方式](#部署方式)
- [方式一：服务器直接部署（推荐）](#方式一服务器直接部署推荐)
- [方式二：本地构建后上传](#方式二本地构建后上传)
- [PM2 常用命令](#pm2 常用命令)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

---

## 🎯 部署方式

### 方式一：服务器直接部署（推荐）
在服务器上拉取代码、构建并启动，适合直接操作服务器的场景。

### 方式二：本地构建后上传
在本地构建好项目，打包上传到服务器，适合本地开发环境。

---

## 方式一：服务器直接部署（推荐）

### 步骤说明

1. **登录服务器**
   ```bash
   ssh root@your-server-ip
   ```

2. **进入项目目录**
   ```bash
   cd /path/to/huang-lao-boss
   ```

3. **运行部署脚本**
   ```bash
   # 给脚本添加执行权限
   chmod +x deploy-server.sh
   
   # 运行脚本
   ./deploy-server.sh
   ```

4. **等待部署完成**
   
   脚本会自动完成以下操作：
   - ✅ 检查 Node.js、npm、Git、PM2
   - ✅ 安装缺失的依赖
   - ✅ 拉取最新代码
   - ✅ 安装项目依赖
   - ✅ 构建项目
   - ✅ 使用 PM2 启动服务
   - ✅ 配置开机自启

5. **验证部署**
   ```bash
   # 查看应用状态
   pm2 status
   
   # 查看应用日志
   pm2 logs huang-lao-boss
   
   # 访问网站
   curl http://localhost:3000
   ```

---

## 方式二：本地构建后上传

### 步骤说明

1. **修改配置**
   
   编辑 `build-and-deploy.sh` 文件，修改以下配置：
   ```bash
   SERVER_USER="root"           # 服务器用户名
   SERVER_HOST="your-server-ip" # 服务器 IP 地址
   SERVER_PATH="/var/www/huang-lao-boss" # 服务器部署路径
   ```

2. **运行脚本**
   ```bash
   # 给脚本添加执行权限
   chmod +x build-and-deploy.sh
   
   # 运行脚本
   ./build-and-deploy.sh
   ```

3. **等待完成**
   
   脚本会自动完成：
   - ✅ 本地安装依赖
   - ✅ 本地构建项目
   - ✅ 打包部署文件
   - ✅ 上传到服务器
   - ✅ 在服务器上解压并启动

4. **验证部署**
   ```bash
   # SSH 登录服务器
   ssh root@your-server-ip
   
   # 查看应用状态
   pm2 status
   
   # 查看日志
   pm2 logs huang-lao-boss
   ```

---

## 🔧 PM2 常用命令

### 查看状态
```bash
# 查看所有应用状态
pm2 status

# 查看详细信息
pm2 show huang-lao-boss

# 查看监控面板
pm2 monit
```

### 启动/停止/重启
```bash
# 启动应用
pm2 start ecosystem.config.js

# 重启应用
pm2 restart huang-lao-boss

# 停止应用
pm2 stop huang-lao-boss

# 删除应用
pm2 delete huang-lao-boss
```

### 日志管理
```bash
# 查看所有日志
pm2 logs

# 查看指定应用日志
pm2 logs huang-lao-boss

# 实时查看日志
pm2 logs huang-lao-boss --lines 100

# 清空日志
pm2 flush
```

### 集群管理
```bash
# 扩展实例数量
pm2 scale huang-lao-boss 4

# 重新加载应用（负载均衡）
pm2 reload huang-lao-boss

# 优雅重启
pm2 reload huang-lao-boss --graceful-timeout 3000
```

### 系统配置
```bash
# 保存当前应用列表
pm2 save

# 配置开机自启
pm2 startup

# 查看已保存的应用列表
pm2 resurrect
```

---

## ⚙️ 环境变量配置

### 创建环境变量文件

在服务器上创建 `.env.local` 或 `.env.production` 文件：

```bash
cd /var/www/huang-lao-boss
nano .env.local
```

### 必要的环境变量

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 网站配置
NEXT_PUBLIC_SITE_NAME=淋淋园牛羊肉
NEXT_PUBLIC_SITE_URL=http://your-domain.com

# 其他配置（可选）
NEXT_PUBLIC_WECHAT_MINIPROGRAM_URL=你的小程序链接
NEXT_PUBLIC_MEITUAN_URL=你的美团店铺链接
NEXT_PUBLIC_ELEME_URL=你的饿了么店铺链接
```

### 在 PM2 中设置环境变量

编辑 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'huang-lao-boss',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_SUPABASE_URL: 'https://...',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '...',
    }
  }]
}
```

---

## 📊 PM2 配置文件说明

### ecosystem.config.js

```javascript
{
  apps: [{
    name: 'huang-lao-boss',        // 应用名称
    script: 'npm',                 // 启动脚本
    args: 'start',                 // 参数
    instances: 'max',              // 实例数量（max = CPU 核心数）
    exec_mode: 'cluster',          // 集群模式
    env: {                         // 环境变量
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/pm2-err.log',     // 错误日志
    out_file: './logs/pm2-out.log',       // 输出日志
    log_file: './logs/pm2-combined.log',  // 合并日志
    time: true,                    // 日志时间戳
    autorestart: true,             // 自动重启
    max_memory_restart: '1G',      // 内存限制
    watch: false,                  // 不监听文件变化
    max_restarts: 10,              // 最大重启次数
    min_uptime: '10s'              // 最小运行时间
  }]
}
```

---

## ❓ 常见问题

### Q1: PM2 未找到命令？

**解决方法：**
```bash
# 全局安装 PM2
npm install -g pm2

# 如果还是找不到，添加 npm 全局目录到 PATH
export PATH=$PATH:$(npm config get prefix)/bin
```

### Q2: 端口被占用？

**解决方法：**
```bash
# 查看端口占用
lsof -i :3000

# 修改端口
# 编辑 ecosystem.config.js，更改 PORT 环境变量
PORT: 3001
```

### Q3: 应用启动后立即退出？

**查看日志：**
```bash
pm2 logs huang-lao-boss --lines 100
```

**可能原因：**
- 环境变量未配置
- 端口被占用
- 构建失败

### Q4: 如何更新代码？

**方式一（推荐）：**
```bash
# 在服务器上
cd /var/www/huang-lao-boss
git pull origin main
./deploy-server.sh
```

**方式二：**
```bash
# 本地构建后上传
./build-and-deploy.sh
```

### Q5: 如何回滚到旧版本？

```bash
# 查看历史版本
git log

# 回滚到指定版本
git reset --hard <commit-hash>

# 重新部署
./deploy-server.sh
```

### Q6: 如何配置 Nginx 反向代理？

**Nginx 配置示例：**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Q7: 如何优化性能？

1. **启用集群模式** - 已在 `ecosystem.config.js` 中配置
2. **增加内存限制** - 调整 `max_memory_restart`
3. **配置 Nginx 缓存** - 静态资源缓存
4. **启用 Gzip 压缩** - Nginx 配置

---

## 🔗 相关资源

- **PM2 官方文档**: https://pm2.keymetrics.io/docs/
- **Next.js 部署文档**: https://nextjs.org/docs/deployment
- **Node.js 性能优化**: https://nodejs.org/en/docs/guides/

---

## 💡 最佳实践

1. **生产环境** - 始终使用 `--production` 标志安装依赖
2. **日志轮转** - 配置 PM2 日志轮转避免磁盘占满
3. **监控告警** - 使用 PM2 Plus 或其他监控工具
4. **备份策略** - 定期备份数据库和环境变量
5. **灰度发布** - 使用 `pm2 reload` 进行零停机部署

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 PM2 日志：`pm2 logs huang-lao-boss`
2. 检查应用状态：`pm2 status`
3. 查看系统资源：`pm2 monit`
4. 在项目 Issues 中提问

**祝你部署顺利！** 🎉
