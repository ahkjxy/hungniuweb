# 🚀 淋淋园牛羊肉 - 阿里云部署完整指南

本指南将帮助你在阿里云服务器上部署项目，包含从购买服务器到上线的完整流程。

## 📋 目录

- [准备工作](#准备工作)
- [步骤一：购买阿里云服务器](#步骤一购买阿里云服务器)
- [步骤二：配置安全组](#步骤二配置安全组)
- [步骤三：连接服务器](#步骤三连接服务器)
- [步骤四：安装环境](#步骤四安装环境)
- [步骤五：部署项目](#步骤五部署项目)
- [步骤六：配置域名和 SSL](#步骤六配置域名和 ssl)
- [步骤七：Nginx 反向代理](#步骤七 nginx 反向代理)
- [常见问题](#常见问题)

---

## 🎯 准备工作

### 需要的账号和服务

1. **阿里云账号** - 已注册并完成实名认证
2. **GitHub 账号** - 用于访问代码仓库
3. **Supabase 账号** - 数据库服务
4. **域名**（可选） - 用于网站访问

### 推荐的服务器配置

**入门配置**（适合个人网站、小规模访问）
- CPU: 2 核
- 内存：2GB
- 带宽：3-5Mbps
- 系统：Ubuntu 20.04 LTS 或 22.04 LTS
- 地域：选择离用户最近的地域

**经济方案**
- 使用阿里云 **轻量应用服务器**（更便宜，适合新手）
- 价格：约 ¥60-100/月

---

## 步骤一：购买阿里云服务器

### 1. 选择服务器类型

#### 方案 A：ECS 云服务器（推荐）
1. 访问 [阿里云 ECS 购买页](https://www.aliyun.com/product/ecs)
2. 选择 **经济型 e 实例** 或 **突发性能型 t6**
3. 配置选择：
   - CPU: 2 核
   - 内存：2GB
   - 系统镜像：Ubuntu 22.04 64 位
   - 存储：40GB ESSD 云盘
   - 带宽：3Mbps（按使用流量付费更便宜）

#### 方案 B：轻量应用服务器（新手推荐）
1. 访问 [阿里云轻量应用服务器](https://www.aliyun.com/product/swas)
2. 选择 **Linux 应用镜像**
3. 价格更低，配置更简单

### 2. 设置密码
- 设置 **root 密码**（务必牢记！）
- 建议保存到密码管理器

### 3. 完成购买
- 确认订单并支付
- 等待服务器创建完成（通常 1-2 分钟）

---

## 步骤二：配置安全组

### 1. 进入安全组配置
1. 登录 [阿里云控制台](https://homenew.console.aliyun.com/)
2. 进入 **云服务器 ECS** → **实例**
3. 找到你的实例，点击 **更多** → **网络和安全组** → **安全组配置**

### 2. 添加入站规则

| 端口范围 | 授权对象 | 说明 |
|---------|---------|------|
| 22/22 | 0.0.0.0/0 | SSH 远程连接 |
| 80/80 | 0.0.0.0/0 | HTTP 访问 |
| 443/443 | 0.0.0.0/0 | HTTPS 访问 |
| 3000/3000 | 0.0.0.0/0 | Next.js 应用（可选，如果直接用 Nginx 则不需要） |

### 添加步骤：
1. 点击 **手动添加**
2. 填写上述规则
3. 点击 **保存**

---

## 步骤三：连接服务器

### 方式一：使用阿里云 Workbench（推荐新手）

1. 在 ECS 控制台找到你的实例
2. 点击 **远程连接**
3. 选择 **Workbench 远程连接**
4. 输入 root 密码登录

### 方式二：使用终端命令（Mac/Linux）

```bash
# 连接到服务器
ssh root@your-server-ip

# 首次连接会询问是否继续，输入 yes
# 然后输入 root 密码
```

### 方式三：使用 PuTTY（Windows）

1. 下载 [PuTTY](https://www.putty.org/)
2. 打开 PuTTY
3. Host Name: `root@your-server-ip`
4. Port: `22`
5. 点击 **Open**
6. 输入密码登录

---

## 步骤四：安装环境

### 1. 更新系统

```bash
# 更新软件包列表
apt update

# 升级已安装的软件包
apt upgrade -y
```

### 2. 安装 Node.js 18

```bash
# 使用 curl 下载 NodeSource 安装脚本
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装 Node.js
apt install -y nodejs

# 验证安装
node -v
npm -v
```

### 3. 安装 Git

```bash
apt install -y git
git --version
```

### 4. 安装 PM2

```bash
# 全局安装 PM2
npm install -g pm2

# 配置 PM2 开机自启
pm2 startup

# 执行输出的命令（类似下面这样）
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

### 5. 安装其他工具（可选但推荐）

```bash
# 安装 unzip（解压文件）
apt install -y unzip

# 安装 vim（文本编辑）
apt install -y vim

# 安装 wget（下载文件）
apt install -y wget
```

---

## 步骤五：部署项目

### 方式一：从 GitHub 拉取代码（推荐）

#### 1. 克隆项目

```bash
# 创建网站目录
mkdir -p /var/www/huang-lao-boss
cd /var/www/huang-lao-boss

# 克隆代码（如果是私有仓库需要配置 SSH Key）
git clone https://github.com/ahkjxy/hungniuweb.git .
```

#### 2. 配置环境变量

```bash
# 创建 .env.local 文件
vim .env.local

# 粘贴以下内容（替换为你的实际值）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

#### 3. 安装依赖

```bash
npm install --production
```

#### 4. 构建项目

```bash
npm run build
```

#### 5. 使用 PM2 启动

```bash
# 确保在项目目录下
cd /var/www/huang-lao-boss

# 使用 PM2 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs huang-lao-boss
```

### 方式二：使用部署脚本（最简单）

```bash
# 进入项目目录
cd /var/www/huang-lao-boss

# 给脚本添加执行权限
chmod +x deploy-server.sh

# 运行部署脚本
./deploy-server.sh
```

脚本会自动完成所有部署步骤！

---

## 步骤六：配置域名和 SSL

### 1. 绑定域名（如果有域名）

#### 在阿里云 DNS 解析
1. 进入 [阿里云 DNS 控制台](https://dns.console.aliyun.com/)
2. 添加记录：
   - 记录类型：A
   - 主机记录：@ 或 www
   - 记录值：你的服务器 IP
   - TTL：10 分钟

### 2. 申请免费 SSL 证书

#### 使用 Let's Encrypt（推荐）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 申请证书（需要先配置好 Nginx）
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 或使用阿里云 SSL 证书
1. 访问 [阿里云 SSL 证书](https://www.aliyun.com/product/cas)
2. 申请免费 DV SSL 证书
3. 下载并上传到服务器

---

## 步骤七：Nginx 反向代理

### 1. 安装 Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 2. 配置 Nginx

```bash
# 创建配置文件
vim /etc/nginx/sites-available/huang-lao-boss
```

粘贴以下配置：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 如果使用 HTTPS，添加 SSL 配置
    # listen 443 ssl http2;
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;

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

    # 静态资源优化
    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/huang-lao-boss /etc/nginx/sites-enabled/

# 删除默认配置
rm /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 4. 自动续期 SSL 证书

```bash
# 测试自动续期
certbot renew --dry-run

# 添加定时任务（通常 certbot 会自动添加）
crontab -e
# 添加：0 3 * * * certbot renew --quiet
```

---

## 🔍 常见问题

### Q1: 无法连接服务器？
**A**: 检查安全组是否开放 22 端口，确认 IP 和密码正确。

### Q2: 网站访问不了？
**A**: 
1. 检查 PM2 是否运行：`pm2 status`
2. 检查防火墙：`ufw status`
3. 检查 Nginx：`systemctl status nginx`
4. 确认域名解析是否生效

### Q3: 内存不足怎么办？
**A**: 
1. 增加 Swap 分区：
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

2. 或者升级服务器配置

### Q4: PM2 进程经常挂掉？
**A**: 修改 `ecosystem.config.js`：
```javascript
{
  max_memory_restart: '512M',  // 降低内存限制
  autorestart: true,
  watch: false
}
```

### Q5: 如何备份数据？
**A**: 
```bash
# 备份整个项目
tar -czf huang-lao-boss-backup.tar.gz /var/www/huang-lao-boss

# 下载备份
scp root@your-server-ip:/var/www/huang-lao-boss-backup.tar.gz ./
```

### Q6: 如何查看日志？
**A**:
```bash
# PM2 日志
pm2 logs huang-lao-boss

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 系统日志
journalctl -u nginx
```

### Q7: 如何更新代码？
**A**:
```bash
cd /var/www/huang-lao-boss
git pull
npm install
npm run build
pm2 restart huang-lao-boss
```

---

## 📊 部署检查清单

- [ ] 阿里云服务器已购买
- [ ] 安全组规则已配置（22, 80, 443 端口）
- [ ] 已连接到服务器
- [ ] Node.js、Git、PM2 已安装
- [ ] 项目代码已拉取
- [ ] 环境变量已配置
- [ ] 项目已构建并启动
- [ ] PM2 已配置开机自启
- [ ] Nginx 已安装并配置
- [ ] 域名已解析（如有）
- [ ] SSL 证书已配置（如需 HTTPS）

---

## 💡 最佳实践

### 1. 安全加固
```bash
# 禁用 root 密码登录，改用 SSH Key
# 配置防火墙
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable

# 定期更新系统
apt update && apt upgrade -y
```

### 2. 监控告警
- 使用阿里云监控服务
- 配置 CPU、内存、磁盘告警
- 使用 PM2 Monitor 监控应用

### 3. 备份策略
- 每周备份一次代码
- 每天备份数据库（Supabase 自动备份）
- 使用阿里云快照功能

### 4. 性能优化
- 开启 Gzip 压缩
- 配置 CDN 加速静态资源
- 使用 Redis 缓存（如需要）

---

## 🎉 部署完成！

恭喜！你的网站已经成功部署到阿里云。

### 访问网站
- HTTP: http://yourdomain.com
- HTTPS: https://yourdomain.com（如已配置 SSL）

### 管理命令
```bash
# 查看应用状态
pm2 status

# 重启应用
pm2 restart huang-lao-boss

# 查看日志
pm2 logs

# 停止应用
pm2 stop huang-lao-boss
```

---

**技术支持**: 如有问题，请查看项目文档或联系技术支持。

**最后更新**: 2026-03-30
