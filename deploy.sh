#!/bin/bash

echo "🚀 开始部署到 Vercel..."
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ 未检测到 Vercel CLI，正在安装..."
    npm install -g vercel
fi

# 检查 Git 状态
echo "📊 检查 Git 状态..."
git status
echo ""

read -p "✅ 继续部署？(y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "❌ 部署已取消"
    exit 1
fi

# 提交更改
echo "💾 提交更改..."
git add .
git commit -m "Deploy to Vercel $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

echo ""
echo "🚀 开始部署到 Vercel..."
echo ""

# 部署到生产环境
vercel --prod

echo ""
echo "✅ 部署完成！"
echo "🌐 访问地址：https://huang-lao-boss.vercel.app"
echo ""
