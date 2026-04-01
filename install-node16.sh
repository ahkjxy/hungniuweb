#!/bin/bash

# 淋淋园牛羊肉 - Node.js 16 快速部署脚本
# 适用于宝塔面板环境

set -e

echo "========================================="
echo "🚀 Node.js 16 快速部署"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

# 检查系统类型
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    print_error "无法识别操作系统类型"
    exit 1
fi

print_info "检测到操作系统：$OS"
echo ""

# 步骤 1：检查是否已安装 Node.js
print_step "[1/4] 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_info "已安装 Node.js: $NODE_VERSION"
    
    if [[ $NODE_VERSION == *"v16"* ]]; then
        print_success "Node.js 16 已安装，无需重复安装"
        read -p "是否继续重新安装？(y/n): " REINSTALL
        if [ "$REINSTALL" != "y" ]; then
            exit 0
        fi
    fi
else
    print_info "未检测到 Node.js"
fi

# 步骤 2：卸载旧版本（如果有）
if command -v node &> /dev/null; then
    print_step "[2/4] 卸载旧版本 Node.js..."
    
    if [ "$OS" == "centos" ] || [ "$OS" == "rhel" ] || [ "$OS" == "almalinux" ] || [ "$OS" == "rocky" ]; then
        yum remove -y nodejs npm
    elif [ "$OS" == "ubuntu" ] || [ "$OS" == "debian" ]; then
        apt remove -y nodejs npm
        apt autoremove -y
    else
        print_error "不支持的系统：$OS"
        exit 1
    fi
    
    print_success "旧版本已卸载"
fi

# 步骤 3：安装 Node.js 16
print_step "[3/4] 安装 Node.js 16..."

if [ "$OS" == "centos" ] || [ "$OS" == "rhel" ] || [ "$OS" == "almalinux" ] || [ "$OS" == "rocky" ]; then
    print_info "使用 RPM 包管理器安装..."
    curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
    yum install -y nodejs
    
elif [ "$OS" == "ubuntu" ] || [ "$OS" == "debian" ]; then
    print_info "使用 APT 包管理器安装..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
    apt-get install -y nodejs
    
else
    print_error "不支持的系统：$OS"
    exit 1
fi

# 验证安装
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    print_success "Node.js 安装成功！"
    print_info "Node.js 版本：$NODE_VERSION"
    print_info "npm 版本：$NPM_VERSION"
else
    print_error "Node.js 安装失败！"
    exit 1
fi

# 步骤 4：安装 PM2
print_step "[4/4] 安装 PM2..."
npm install -g pm2
pm2 --version
print_success "PM2 安装完成"

# 显示完成信息
echo ""
echo "========================================="
print_success "🎉 Node.js 16 安装完成！"
echo "========================================="
echo ""
print_info "下一步操作："
echo ""
print_info "1. 进入项目目录"
echo "   cd /www/wwwroot/linlinyuan.com"
echo ""
print_info "2. 安装项目依赖"
echo "   npm install --production"
echo ""
print_info "3. 构建项目"
echo "   npm run build"
echo ""
print_info "4. 启动应用"
echo "   pm2 start ecosystem.config.js"
echo ""
print_info "5. 查看状态"
echo "   pm2 status"
echo ""

# 保存安装报告
REPORT_FILE="/tmp/nodejs16-install-$(date +%Y%m%d-%H%M%S).log"
cat > "$REPORT_FILE" << EOF
Node.js 16 安装报告
==================
安装时间：$(date '+%Y-%m-%d %H:%M:%S')
操作系统：$OS
Node.js 版本：$(node -v)
npm 版本：$(npm -v)
PM2 版本：$(pm2 --version)

下一步操作：
cd /www/wwwroot/linlinyuan.com
npm install --production
npm run build
pm2 start ecosystem.config.js
EOF

print_success "安装报告已保存到：$REPORT_FILE"
echo ""
