#!/bin/bash

# =============================================================================
# 淋淋园牛羊肉 - 本地构建并上传到服务器脚本
# 用途：在本地构建项目，然后上传到服务器部署
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
echo "   📦 淋淋园牛羊肉 - 构建并上传"
echo "========================================"
echo ""

# =============================================================================
# 配置部分（请根据实际情况修改）
# =============================================================================
SERVER_USER="root"           # 服务器用户名
SERVER_HOST="your-server-ip" # 服务器 IP 地址
SERVER_PATH="/var/www/huang-lao-boss" # 服务器部署路径

# =============================================================================
# 步骤 1: 环境检查
# =============================================================================
print_info "步骤 1/5: 检查环境依赖..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    print_error "未检测到 Node.js"
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

# 检查 SSH
if ! command -v ssh &> /dev/null; then
    print_error "未检测到 SSH，无法连接服务器"
    exit 1
fi

print_success "SSH 已安装"

echo ""

# =============================================================================
# 步骤 2: 确认服务器信息
# =============================================================================
print_info "步骤 2/5: 确认服务器信息..."
echo ""
echo "服务器信息："
echo "  用户：$SERVER_USER"
echo "  主机：$SERVER_HOST"
echo "  路径：$SERVER_PATH"
echo ""

read -p "是否继续？(y/n): " confirm
if [ "$confirm" != "y" ]; then
    print_error "操作已取消"
    exit 1
fi

echo ""

# =============================================================================
# 步骤 3: 本地构建
# =============================================================================
print_info "步骤 3/5: 本地构建项目..."

# 安装依赖
print_info "安装依赖..."
npm install --production

# 构建项目
print_info "执行构建..."
npm run build

if [ $? -eq 0 ]; then
    print_success "项目构建成功"
else
    print_error "项目构建失败"
    exit 1
fi

echo ""

# =============================================================================
# 步骤 4: 打包文件
# =============================================================================
print_info "步骤 4/5: 打包部署文件..."

# 创建临时目录
TEMP_DIR=$(mktemp -d)
print_info "创建临时目录：$TEMP_DIR"

# 复制必要文件
print_info "复制文件到临时目录..."
cp -r .next "$TEMP_DIR/"
cp -r node_modules "$TEMP_DIR/"
cp -r public "$TEMP_DIR/" 2>/dev/null || true
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/"
cp next.config.js "$TEMP_DIR/"
cp ecosystem.config.js "$TEMP_DIR/"
cp -r .env* "$TEMP_DIR/" 2>/dev/null || true

# 创建压缩包
ARCHIVE_NAME="huang-lao-boss-$(date +%Y%m%d-%H%M%S).tar.gz"
print_info "创建压缩包：$ARCHIVE_NAME"
tar -czf "$ARCHIVE_NAME" -C "$TEMP_DIR" .

# 清理临时目录
rm -rf "$TEMP_DIR"

print_success "打包完成：$ARCHIVE_NAME"
echo ""

# =============================================================================
# 步骤 5: 上传到服务器
# =============================================================================
print_info "步骤 5/5: 上传到服务器..."

# 测试 SSH 连接
print_info "测试 SSH 连接..."
if ! ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo '连接成功'" > /dev/null 2>&1; then
    print_error "无法连接到服务器，请检查网络和服务器的 SSH 配置"
    # 清理压缩包
    rm -f "$ARCHIVE_NAME"
    exit 1
fi

print_success "SSH 连接正常"

# 在服务器上创建目录
print_info "在服务器上创建目录..."
ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $SERVER_PATH"

# 上传压缩包
print_info "上传文件到服务器..."
scp "$ARCHIVE_NAME" "$SERVER_USER@$SERVER_HOST:/tmp/"

if [ $? -eq 0 ]; then
    print_success "文件上传成功"
else
    print_error "文件上传失败"
    rm -f "$ARCHIVE_NAME"
    exit 1
fi

# 在服务器上解压并部署
print_info "在服务器上部署..."
ssh "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    cd /tmp
    echo "解压文件..."
    tar -xzf huang-lao-boss-*.tar.gz -C $SERVER_PATH --strip-components=1
    echo "清理临时文件..."
    rm -f huang-lao-boss-*.tar.gz
    cd $SERVER_PATH
    
    # 检查 PM2 是否安装
    if ! command -v pm2 &> /dev/null; then
        echo "PM2 未安装，正在安装..."
        npm install -g pm2
    fi
    
    # 停止旧应用
    echo "停止旧应用..."
    pm2 stop huang-lao-boss 2>/dev/null || true
    pm2 delete huang-lao-boss 2>/dev/null || true
    
    # 启动新应用
    echo "启动新应用..."
    pm2 start ecosystem.config.js
    
    # 保存 PM2 配置
    pm2 save
    
    echo "部署完成！"
ENDSSH

if [ $? -eq 0 ]; then
    print_success "服务器部署成功！"
else
    print_error "服务器部署失败"
    rm -f "$ARCHIVE_NAME"
    exit 1
fi

# 清理本地压缩包
rm -f "$ARCHIVE_NAME"

echo ""
echo "========================================"
echo "   🎉 部署完成！"
echo "========================================"
echo ""
print_success "服务已启动在服务器上"
echo ""
print_info "访问地址：http://$SERVER_HOST:3000"
echo ""
print_info "登录服务器查看日志："
echo "  ssh $SERVER_USER@$SERVER_HOST"
echo "  pm2 logs huang-lao-boss"
echo ""
