#!/bin/bash

# =============================================================================
# 淋淋园牛羊肉 - 一键部署脚本
# 支持：本地构建 / Vercel 部署
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
echo "   🚜 淋淋园牛羊肉 - 部署脚本"
echo "========================================"
echo ""

# =============================================================================
# 步骤 1: 环境检查
# =============================================================================
print_info "步骤 1/6: 检查环境依赖..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    print_error "未检测到 Node.js，请先安装 Node.js 18+"
    echo "👉 下载地址：https://nodejs.org/"
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
    print_error "未检测到 Git，请先安装 Git"
    echo "👉 下载地址：https://git-scm.com/"
    exit 1
fi

GIT_VERSION=$(git --version)
print_success "Git 已安装：$GIT_VERSION"

# 检查 Vercel CLI（可选）
VERCEL_INSTALLED=false
if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel --version)
    print_success "Vercel CLI 已安装：$VERCEL_VERSION"
    VERCEL_INSTALLED=true
else
    print_warning "Vercel CLI 未安装（如需 Vercel 部署则必须）"
fi

echo ""

# =============================================================================
# 步骤 2: 选择部署模式
# =============================================================================
print_info "步骤 2/6: 选择部署模式"
echo ""
echo "请选择部署目标："
echo "  1) 本地构建测试（npm run build）"
echo "  2) Vercel 部署（生产环境）"
echo "  3) 仅安装依赖（不构建）"
echo ""
read -p "请输入选项 (1/2/3): " deploy_mode

case $deploy_mode in
    1)
        print_info "选择：本地构建测试"
        BUILD_ONLY=true
        DEPLOY_VERCEL=false
        ;;
    2)
        print_info "选择：Vercel 部署"
        BUILD_ONLY=false
        DEPLOY_VERCEL=true
        
        # 如果 Vercel CLI 未安装，询问是否安装
        if [ "$VERCEL_INSTALLED" = false ]; then
            read -p "需要安装 Vercel CLI，是否继续？(y/n): " install_vercel
            if [ "$install_vercel" = "y" ]; then
                print_info "正在安装 Vercel CLI..."
                npm install -g vercel
                print_success "Vercel CLI 安装完成"
            else
                print_error "部署已取消"
                exit 1
            fi
        fi
        ;;
    3)
        print_info "选择：仅安装依赖"
        INSTALL_ONLY=true
        ;;
    *)
        print_error "无效的选项"
        exit 1
        ;;
esac

echo ""

# =============================================================================
# 步骤 3: 检查 Git 状态（仅 Vercel 部署需要）
# =============================================================================
if [ "$DEPLOY_VERCEL" = true ]; then
    print_info "步骤 3/6: 检查 Git 状态..."
    echo ""
    git status
    echo ""
    
    # 检查是否有未提交的更改
    CHANGES=$(git status --porcelain)
    if [ -n "$CHANGES" ]; then
        read -p "检测到未提交的更改，是否提交并推送？(y/n): " commit_changes
        if [ "$commit_changes" = "y" ]; then
            print_info "正在提交更改..."
            git add .
            git commit -m "Deploy to Vercel $(date '+%Y-%m-%d %H:%M:%S')"
            git push origin main
            print_success "代码已提交并推送"
        else
            print_warning "跳过代码提交，继续部署"
        fi
    else
        print_success "工作区干净，无需提交"
    fi
    
    echo ""
fi

# =============================================================================
# 步骤 4: 安装依赖
# =============================================================================
print_info "步骤 $(if [ "$DEPLOY_VERCEL" = true ]; then echo "4/6"; else echo "3/6"; fi): 安装项目依赖..."
echo ""

# 检查 node_modules 是否存在
if [ -d "node_modules" ]; then
    read -p "检测到已有依赖，是否重新安装？(y/n): " reinstall
    if [ "$reinstall" = "y" ]; then
        print_info "清理旧的依赖..."
        rm -rf node_modules package-lock.json
        print_success "清理完成"
    fi
fi

print_info "执行 npm install..."
npm install

if [ $? -eq 0 ]; then
    print_success "依赖安装完成"
else
    print_error "依赖安装失败"
    exit 1
fi

echo ""

# 如果选择仅安装依赖，到此结束
if [ "$INSTALL_ONLY" = true ]; then
    print_success "依赖安装完成！可以运行以下命令启动开发服务器："
    echo "  npm run dev"
    exit 0
fi

# =============================================================================
# 步骤 5: 构建项目（本地构建或 Vercel 部署前测试）
# =============================================================================
print_info "步骤 $(if [ "$DEPLOY_VERCEL" = true ]; then echo "5/6"; else echo "4/6"; fi): 构建项目..."
echo ""

print_info "执行 npm run build..."
npm run build

if [ $? -eq 0 ]; then
    print_success "项目构建成功"
else
    print_error "项目构建失败"
    exit 1
fi

echo ""

# 如果只是本地构建测试，到此结束
if [ "$BUILD_ONLY" = true ]; then
    print_success "本地构建完成！"
    echo ""
    echo "💡 提示："
    echo "  - 运行 'npm run start' 在本地预览生产版本"
    echo "  - 运行 'npm run dev' 启动开发服务器"
    exit 0
fi

# =============================================================================
# 步骤 6: 部署到 Vercel
# =============================================================================
if [ "$DEPLOY_VERCEL" = true ]; then
    print_info "步骤 6/6: 部署到 Vercel..."
    echo ""
    
    # 检查是否已登录 Vercel
    if ! vercel whoami &> /dev/null 2>&1; then
        print_warning "未检测到 Vercel 登录状态"
        read -p "是否现在登录 Vercel？(y/n): " login_vercel
        if [ "$login_vercel" = "y" ]; then
            vercel login
        else
            print_error "部署已取消"
            exit 1
        fi
    fi
    
    print_success "Vercel 登录状态正常"
    echo ""
    
    # 部署
    print_info "开始部署到 Vercel..."
    echo ""
    
    # 询问部署范围
    read -p "部署到哪个环境？(1=生产环境 production, 2=预览环境 preview): " deploy_target
    
    if [ "$deploy_target" = "1" ]; then
        print_info "部署到生产环境..."
        vercel --prod
    else
        print_info "部署到预览环境..."
        vercel
    fi
    
    if [ $? -eq 0 ]; then
        echo ""
        print_success "部署完成！"
        echo ""
        echo "🌐 访问地址："
        echo "  https://huang-lao-boss.vercel.app"
        echo ""
        echo "💡 提示："
        echo "  - 访问 Vercel Dashboard 查看部署详情：https://vercel.com/dashboard"
        echo "  - 查看部署日志：vercel logs"
    else
        print_error "部署失败"
        exit 1
    fi
fi

echo ""
echo "========================================"
echo "   🎉 部署流程完成！"
echo "========================================"
echo ""
