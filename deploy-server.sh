#!/bin/bash

# =============================================================================
# 淋淋园牛羊肉 - 服务器部署脚本（使用 PM2）
# 用途：在服务器上拉取代码、构建并启动服务
# =============================================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 打印横幅
echo ""
echo "========================================"
echo "   🚜 淋淋园牛羊肉 - 服务器部署"
echo "========================================"
echo ""

# =============================================================================
# 步骤 1: 环境检查
# =============================================================================
print_info "步骤 1/7: 检查环境依赖..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    print_error "未检测到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js 已安装：$NODE_VERSION"

# 检查 npm
if ! command -v npm &> /dev/null; then
    print_error "未检测到 npm"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm 已安装：$NPM_VERSION"

# 检查 Git
if ! command -v git &> /dev/null; then
    print_error "未检测到 Git"
    exit 1
fi

GIT_VERSION=$(git --version)
print_success "Git 已安装：$GIT_VERSION"

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 未安装，正在全局安装..."
    npm install -g pm2
    print_success "PM2 安装完成"
else
    PM2_VERSION=$(pm2 -v)
    print_success "PM2 已安装：$PM2_VERSION"
fi

echo ""

# =============================================================================
# 步骤 2: 进入项目目录
# =============================================================================
print_info "步骤 2/7: 进入项目目录..."

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR" || exit 1

print_success "已进入项目目录：$SCRIPT_DIR"
echo ""

# =============================================================================
# 步骤 3: 拉取最新代码
# =============================================================================
print_info "步骤 3/7: 拉取最新代码..."

# 检查是否是 git 仓库
if [ -d ".git" ]; then
    print_info "检测到 Git 仓库，正在拉取最新代码..."
    git fetch origin main
    git reset --hard origin/main
    print_success "代码已更新到最新版本"
else
    print_warning "不是 Git 仓库，跳过代码拉取"
fi

echo ""

# =============================================================================
# 步骤 4: 安装依赖
# =============================================================================
print_info "步骤 4/7: 安装项目依赖..."

# 检查 node_modules 是否存在
if [ -d "node_modules" ]; then
    print_info "检测到已有依赖，检查是否需要更新..."
    
    # 检查 package-lock.json 是否变化
    if [ -f "package-lock.json" ]; then
        npm ci --production
    else
        npm install --production
    fi
else
    print_info "首次安装依赖..."
    npm install --production
fi

print_success "依赖安装完成"
echo ""

# =============================================================================
# 步骤 5: 构建项目
# =============================================================================
print_info "步骤 5/7: 构建项目..."

print_info "执行 npm run build..."
npm run build

if [ $? -eq 0 ]; then
    print_success "项目构建成功"
else
    print_error "项目构建失败"
    exit 1
fi

echo ""

# =============================================================================
# 步骤 6: 检查环境变量
# =============================================================================
print_info "步骤 6/7: 检查环境变量配置..."

if [ ! -f ".env.local" ] && [ ! -f ".env.production" ] && [ ! -f ".env" ]; then
    print_warning "未检测到环境变量文件！"
    print_info "请创建以下任一文件："
    echo "  - .env.local"
    echo "  - .env.production"
    echo "  - .env"
    echo ""
    print_info "必要的环境变量："
    echo "  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
    echo ""
    
    read -p "是否现在创建 .env.local 文件？(y/n): " create_env
    if [ "$create_env" = "y" ]; then
        cp .env.local.example .env.local 2>/dev/null || touch .env.local
        print_success "已创建 .env.local 文件，请编辑填写配置后重新运行此脚本"
        exit 0
    fi
else
    print_success "环境变量文件已存在"
fi

echo ""

# =============================================================================
# 步骤 7: 使用 PM2 启动/重启服务
# =============================================================================
print_info "步骤 7/7: 使用 PM2 启动服务..."

# 检查应用是否已运行
if pm2 describe huang-lao-boss > /dev/null 2>&1; then
    print_info "应用已在运行，正在重启..."
    pm2 restart ecosystem.config.js
else
    print_info "首次启动应用..."
    pm2 start ecosystem.config.js
fi

# 等待应用启动
sleep 3

# 检查应用状态
if pm2 describe huang-lao-boss | grep -q "online"; then
    print_success "应用启动成功！"
    echo ""
    print_info "查看应用状态："
    echo "  pm2 status"
    echo ""
    print_info "查看应用日志："
    echo "  pm2 logs huang-lao-boss"
    echo ""
    print_info "查看监控面板："
    echo "  pm2 monit"
    echo ""
    print_info "停止应用："
    echo "  pm2 stop huang-lao-boss"
    echo ""
    print_info "删除应用："
    echo "  pm2 delete huang-lao-boss"
else
    print_error "应用启动失败，请检查日志"
    pm2 logs huang-lao-boss --lines 20 --nostream
    exit 1
fi

echo ""

# =============================================================================
# 设置 PM2 开机自启
# =============================================================================
print_info "配置 PM2 开机自启..."

pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

print_success "PM2 开机自启已配置"

echo ""
echo "========================================"
echo "   🎉 部署完成！"
echo "========================================"
echo ""
print_success "服务已启动，访问地址：http://localhost:3000"
echo ""
print_info "常用 PM2 命令："
echo "  pm2 status              - 查看应用状态"
echo "  pm2 logs huang-lao-boss - 查看应用日志"
echo "  pm2 monit               - 查看监控面板"
echo "  pm2 restart huang-lao-boss - 重启应用"
echo "  pm2 stop huang-lao-boss - 停止应用"
echo "  pm2 delete huang-lao-boss - 删除应用"
echo ""
