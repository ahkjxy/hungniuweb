# 🚀 淋淋园牛羊肉 - 一键部署指南

本指南将帮助你在 Windows 或 Mac 电脑上快速部署项目到 Vercel 或进行本地构建。

## 📋 目录

- [前置要求](#前置要求)
- [Mac / Linux 用户](#mac--linux-用户)
- [Windows 用户](#windows-用户)
- [部署模式说明](#部署模式说明)
- [常见问题](#常见问题)

---

## 🛠️ 前置要求

### 必须安装的软件：

1. **Node.js 18+** 
   - 下载地址：https://nodejs.org/
   - 验证安装：`node -v`

2. **npm**（随 Node.js 一起安装）
   - 验证安装：`npm -v`

3. **Git**
   - 下载地址：https://git-scm.com/
   - 验证安装：`git --version`

### 可选软件（仅 Vercel 部署需要）：

4. **Vercel CLI**
   - 会自动安装，也可以手动安装：
   ```bash
   npm install -g vercel
   ```

---

## Mac / Linux 用户

### 方式一：使用一键部署脚本（推荐）

```bash
# 1. 给脚本添加执行权限
chmod +x deploy.sh

# 2. 运行部署脚本
./deploy.sh
```

### 方式二：手动部署

#### 1. 本地构建测试

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 本地预览生产版本
npm run start
```

#### 2. 部署到 Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

---

## Windows 用户

### 方式一：使用 PowerShell 脚本（推荐）

```powershell
# 1. 打开 PowerShell（以管理员身份运行）
# 2. 切换到项目目录
cd C:\path\to\huang-lao-boss

# 3. 运行部署脚本
.\deploy.ps1
```

如果遇到执行策略错误，请先运行：
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 方式二：手动部署

参考 Mac/Linux 的手动部署步骤，在 PowerShell 或 CMD 中执行相同命令。

---

## 🎯 部署模式说明

运行部署脚本后，会有三个选项：

### 1️⃣ 本地构建测试

**用途：** 在本地测试项目能否成功构建

**流程：**
1. 检查环境依赖
2. 安装项目依赖
3. 执行 `npm run build`
4. 构建完成后结束

**适合场景：**
- 首次部署前测试
- 代码修改后验证
- 不想发布到线上时

### 2️⃣ Vercel 部署（生产环境）

**用途：** 将项目部署到 Vercel 生产环境

**流程：**
1. 检查环境依赖
2. 检查 Git 状态
3. 提交并推送代码（如有更改）
4. 安装项目依赖
5. 本地构建测试
6. 部署到 Vercel 生产环境

**适合场景：**
- 正式发布新版本
- 更新线上代码

**访问地址：** https://huang-lao-boss.vercel.app

### 3️⃣ 仅安装依赖

**用途：** 只安装项目依赖，不构建

**流程：**
1. 检查环境依赖
2. 安装项目依赖
3. 结束

**适合场景：**
- 刚克隆项目后
- 依赖损坏需要重装

---

## 📝 详细步骤示例

### 完整部署流程（以 Mac 为例）

```bash
# 1. 克隆项目（如果是第一次）
git clone <仓库地址> huang-lao-boss
cd huang-lao-boss

# 2. 给脚本添加执行权限
chmod +x deploy.sh

# 3. 运行部署脚本
./deploy.sh

# 4. 根据提示选择部署模式
# 输入 2 选择 "Vercel 部署"

# 5. 按照提示操作
# - 确认是否提交代码
# - 确认是否安装 Vercel CLI
# - 登录 Vercel（如果未登录）
# - 选择部署环境（生产/预览）

# 6. 等待部署完成
# 成功后会显示访问地址
```

---

## ❓ 常见问题

### Q1: 提示 "Permission denied" 怎么办？

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows (PowerShell):**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Q2: npm install 太慢或失败？

使用淘宝镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q3: Vercel CLI 安装失败？

手动安装：
```bash
npm install -g vercel
```

如果还是失败，可以跳过 Vercel 部署，选择"本地构建测试"。

### Q4: Git 提交失败？

检查 Git 配置：
```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### Q5: 部署后网站无法访问？

1. 检查 Supabase 环境变量是否配置正确
2. 查看 Vercel 部署日志：`vercel logs`
3. 在 Vercel Dashboard 检查构建错误

### Q6: 如何查看部署日志？

```bash
# 查看最近部署的日志
vercel logs

# 实时查看日志
vercel logs --follow
```

### Q7: 如何回滚到之前的版本？

```bash
# 列出所有部署
vercel ls

# 回滚到指定部署
vercel rollback <部署 ID>
```

---

## 🔗 相关资源

- **Vercel 官方文档**: https://vercel.com/docs
- **Next.js 部署文档**: https://nextjs.org/docs/deployment
- **Vercel CLI 文档**: https://vercel.com/docs/cli
- **项目仓库**: https://github.com/your-repo/huang-lao-boss

---

## 💡 小贴士

1. **首次部署建议**：先选择"本地构建测试"，确保项目能成功构建
2. **生产部署**：确保所有测试都通过后再部署到生产环境
3. **环境变量**：敏感信息请在 Vercel Dashboard 中配置
4. **自定义域名**：可以在 Vercel Dashboard 中绑定自己的域名
5. **自动部署**：连接 GitHub 后，每次 push 会自动部署

---

## 📞 需要帮助？

如果遇到问题：
1. 查看终端的错误信息
2. 检查 `.env.local` 配置是否正确
3. 查看 Vercel 部署日志
4. 在项目 Issues 中提问

**祝你部署顺利！** 🎉
