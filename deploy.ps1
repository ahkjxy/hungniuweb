# =============================================================================
# 淋淋园牛羊肉 - 一键部署脚本 (Windows PowerShell)
# 支持：本地构建 / Vercel 部署
# =============================================================================

$ErrorActionPreference = "Stop"

# 打印横幅
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🚜 淋淋园牛羊肉 - 部署脚本 (Windows)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# =============================================================================
# 步骤 1: 环境检查
# =============================================================================
Write-Host "步骤 1/6: 检查环境依赖..." -ForegroundColor Blue

# 检查 Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安装：$nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未检测到 Node.js，请先安装 Node.js 18+" -ForegroundColor Red
    Write-Host "👉 下载地址：https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 检查 npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm 已安装：$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未检测到 npm" -ForegroundColor Red
    exit 1
}

# 检查 Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git 已安装：$gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未检测到 Git，请先安装 Git" -ForegroundColor Red
    Write-Host "👉 下载地址：https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

# 检查 Vercel CLI
$vercelInstalled = $false
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI 已安装：$vercelVersion" -ForegroundColor Green
    $vercelInstalled = $true
} catch {
    Write-Host "⚠️  Vercel CLI 未安装（如需 Vercel 部署则必须）" -ForegroundColor Yellow
}

Write-Host ""

# =============================================================================
# 步骤 2: 选择部署模式
# =============================================================================
Write-Host "步骤 2/6: 选择部署模式" -ForegroundColor Blue
Write-Host ""
Write-Host "请选择部署目标：" -ForegroundColor White
Write-Host "  1) 本地构建测试（npm run build）" -ForegroundColor White
Write-Host "  2) Vercel 部署（生产环境）" -ForegroundColor White
Write-Host "  3) 仅安装依赖（不构建）" -ForegroundColor White
Write-Host ""

$deployMode = Read-Host "请输入选项 (1/2/3)"

$buildOnly = $false
$deployVercel = $false
$installOnly = $false

switch ($deployMode) {
    "1" {
        Write-Host "选择：本地构建测试" -ForegroundColor Cyan
        $buildOnly = $true
    }
    "2" {
        Write-Host "选择：Vercel 部署" -ForegroundColor Cyan
        $deployVercel = $true
        
        # 如果 Vercel CLI 未安装，询问是否安装
        if (-not $vercelInstalled) {
            $installVercel = Read-Host "需要安装 Vercel CLI，是否继续？(y/n)"
            if ($installVercel -eq "y") {
                Write-Host "正在安装 Vercel CLI..." -ForegroundColor Cyan
                npm install -g vercel
                Write-Host "✅ Vercel CLI 安装完成" -ForegroundColor Green
            } else {
                Write-Host "❌ 部署已取消" -ForegroundColor Red
                exit 1
            }
        }
    }
    "3" {
        Write-Host "选择：仅安装依赖" -ForegroundColor Cyan
        $installOnly = $true
    }
    default {
        Write-Host "❌ 无效的选项" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# =============================================================================
# 步骤 3: 检查 Git 状态（仅 Vercel 部署需要）
# =============================================================================
if ($deployVercel) {
    Write-Host "步骤 3/6: 检查 Git 状态..." -ForegroundColor Blue
    Write-Host ""
    git status
    Write-Host ""
    
    # 检查是否有未提交的更改
    $changes = git status --porcelain
    if ($changes) {
        $commitChanges = Read-Host "检测到未提交的更改，是否提交并推送？(y/n)"
        if ($commitChanges -eq "y") {
            Write-Host "正在提交更改..." -ForegroundColor Cyan
            git add .
            git commit -m "Deploy to Vercel $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git push origin main
            Write-Host "✅ 代码已提交并推送" -ForegroundColor Green
        } else {
            Write-Host "⚠️  跳过代码提交，继续部署" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ 工作区干净，无需提交" -ForegroundColor Green
    }
    
    Write-Host ""
}

# =============================================================================
# 步骤 4: 安装依赖
# =============================================================================
$stepNum = if ($deployVercel) { 4 } else { 3 }
Write-Host "步骤 $stepNum/6: 安装项目依赖..." -ForegroundColor Blue
Write-Host ""

# 检查 node_modules 是否存在
if (Test-Path "node_modules") {
    $reinstall = Read-Host "检测到已有依赖，是否重新安装？(y/n)"
    if ($reinstall -eq "y") {
        Write-Host "清理旧的依赖..." -ForegroundColor Cyan
        Remove-Item -Recurse -Force "node_modules"
        Remove-Item -Force "package-lock.json"
        Write-Host "✅ 清理完成" -ForegroundColor Green
    }
}

Write-Host "执行 npm install..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 如果选择仅安装依赖，到此结束
if ($installOnly) {
    Write-Host "✅ 依赖安装完成！可以运行以下命令启动开发服务器：" -ForegroundColor Green
    Write-Host "  npm run dev" -ForegroundColor Cyan
    exit 0
}

# =============================================================================
# 步骤 5: 构建项目
# =============================================================================
$stepNum = if ($deployVercel) { 5 } else { 4 }
Write-Host "步骤 $stepNum/6: 构建项目..." -ForegroundColor Blue
Write-Host ""

Write-Host "执行 npm run build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 项目构建成功" -ForegroundColor Green
} else {
    Write-Host "❌ 项目构建失败" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 如果只是本地构建测试，到此结束
if ($buildOnly) {
    Write-Host "✅ 本地构建完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 提示：" -ForegroundColor Cyan
    Write-Host "  - 运行 'npm run start' 在本地预览生产版本" -ForegroundColor White
    Write-Host "  - 运行 'npm run dev' 启动开发服务器" -ForegroundColor White
    exit 0
}

# =============================================================================
# 步骤 6: 部署到 Vercel
# =============================================================================
if ($deployVercel) {
    Write-Host "步骤 6/6: 部署到 Vercel..." -ForegroundColor Blue
    Write-Host ""
    
    # 检查是否已登录 Vercel
    try {
        $null = vercel whoami 2>&1
        Write-Host "✅ Vercel 登录状态正常" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  未检测到 Vercel 登录状态" -ForegroundColor Yellow
        $loginVercel = Read-Host "是否现在登录 Vercel？(y/n)"
        if ($loginVercel -eq "y") {
            vercel login
        } else {
            Write-Host "❌ 部署已取消" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host ""
    
    # 部署
    Write-Host "开始部署到 Vercel..." -ForegroundColor Cyan
    Write-Host ""
    
    # 询问部署范围
    $deployTarget = Read-Host "部署到哪个环境？(1=生产环境 production, 2=预览环境 preview)"
    
    if ($deployTarget -eq "1") {
        Write-Host "部署到生产环境..." -ForegroundColor Cyan
        vercel --prod
    } else {
        Write-Host "部署到预览环境..." -ForegroundColor Cyan
        vercel
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 部署完成！" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 访问地址：" -ForegroundColor Cyan
        Write-Host "  https://huang-lao-boss.vercel.app" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 提示：" -ForegroundColor Cyan
        Write-Host "  - 访问 Vercel Dashboard 查看部署详情：https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "  - 查看部署日志：vercel logs" -ForegroundColor White
    } else {
        Write-Host "❌ 部署失败" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   🎉 部署流程完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
