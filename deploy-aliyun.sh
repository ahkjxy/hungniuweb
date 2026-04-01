#!/bin/bash

# 淋淋园牛羊肉 - 阿里云一键部署脚本
# 使用方法：在服务器上运行 ./deploy-aliyun.sh

set -e

echo "========================================="
echo "🚀 淋淋园牛羊肉 - 阿里云一键部署"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印函数
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# 检查是否以 root 用户运行
if [ "$EUID" -ne 0 ]; then 
    print_error "请使用 root 用户运行此脚本"
    exit 1
fi

# 询问配置信息
echo ""
echo "请配置以下信息："
echo "-------------------"
read -p "请输入 GitHub 仓库地址 (默认：https://github.com/ahkjxy/hungniuweb.git): " REPO_URL
REPO_URL=${REPO_URL:-"https://github.com/ahkjxy/hungniuweb.git"}

read -p "请输入部署目录 (默认：/var/www/huang-lao-boss): " DEPLOY_DIR
DEPLOY_DIR=${DEPLOY_DIR:-"/var/www/huang-lao-boss"}

echo ""
print_info "GitHub 仓库：$REPO_URL"
print_info "部署目录：$DEPLOY_DIR"
echo ""
read -p "确认开始部署？(y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    print_error "部署已取消"
    exit 1
fi
echo ""

# 步骤 1: 更新系统
print_info "[1/8] 更新系统..."
apt update
apt upgrade -y
print_success "系统更新完成"

# 步骤 2: 安装基础软件
print_info "[2/8] 安装基础软件..."
apt install -y git curl wget vim unzip nginx
print_success "基础软件安装完成"

# 步骤 3: 安装 Node.js
print_info "[3/8] 安装 Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
print_success "Node.js 安装完成 (版本：$(node -v))"

# 步骤 4: 安装 PM2
print_info "[4/8] 安装 PM2..."
npm install -g pm2
pm2 startup
print_success "PM2 安装完成"

# 步骤 5: 克隆项目
print_info "[5/8] 克隆项目代码..."
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

if [ -d ".git" ]; then
    print_info "检测到已有项目，执行 git pull..."
    git pull
else
    git clone "$REPO_URL" .
fi
print_success "项目代码准备完成"

# 步骤 6: 配置环境变量
print_info "[6/8] 配置环境变量..."
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# 生产环境配置
NODE_ENV=production
PORT=3000
EOF
    print_success "环境变量文件已创建，请编辑 .env.local 填入实际值"
    print_info "使用命令：vim .env.local"
else
    print_success "环境变量文件已存在"
fi

echo ""
read -p "是否现在编辑 .env.local？(y/n): " EDIT_ENV
if [ "$EDIT_ENV" = "y" ]; then
    vim .env.local
fi
echo ""

# 步骤 7: 安装依赖并构建
print_info "[7/8] 安装依赖并构建项目..."
npm install --production
npm run build
print_success "项目构建完成"

# 步骤 8: 启动应用
print_info "[8/8] 使用 PM2 启动应用..."
pm2 delete huang-lao-boss 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
print_success "应用已启动"

# 配置 Nginx（可选）
echo ""
read -p "是否配置 Nginx 反向代理？(y/n): " CONFIGURE_NGINX
if [ "$CONFIGURE_NGINX" = "y" ]; then
    print_info "配置 Nginx..."
    
    read -p "请输入域名 (留空则跳过): " DOMAIN_NAME
    
    if [ -n "$DOMAIN_NAME" ]; then
        cat > /etc/nginx/sites-available/huang-lao-boss << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
        
        ln -sf /etc/nginx/sites-available/huang-lao-boss /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        nginx -t
        systemctl restart nginx
        
        print_success "Nginx 配置完成"
        print_info "访问：http://$DOMAIN_NAME"
    else
        print_info "跳过 Nginx 配置"
    fi
fi

# 显示部署信息
echo ""
echo "========================================="
print_success "🎉 部署完成！"
echo "========================================="
echo ""
print_info "应用状态:"
pm2 status
echo ""
print_info "访问地址:"
echo "  - 本地：http://localhost:3000"
if [ -n "$DOMAIN_NAME" ]; then
    echo "  - 公网：http://$DOMAIN_NAME"
fi
echo ""
print_info "管理命令:"
echo "  - 查看日志：pm2 logs huang-lao-boss"
echo "  - 重启应用：pm2 restart huang-lao-boss"
echo "  - 停止应用：pm2 stop huang-lao-boss"
echo "  - 查看状态：pm2 status"
echo ""
print_info "下次更新代码只需运行:"
echo "  cd $DEPLOY_DIR"
echo "  git pull && npm install && npm run build && pm2 restart huang-lao-boss"
echo ""
