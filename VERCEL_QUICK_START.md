# 🚀 Vercel 部署快速指南

## ⚡️ 3 步快速部署

### 第 1 步：推送到 GitHub

```bash
# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库并推送
git remote add origin https://github.com/your-username/huang-lao-boss.git
git branch -M main
git push -u origin main
```

---

### 第 2 步：在 Vercel 导入项目

1. **访问** [vercel.com/new](https://vercel.com/new)
2. **点击** "Import Git Repository"
3. **选择** 你的 GitHub 仓库
4. **点击** "Import Project"

**框架自动识别为 Next.js，无需手动配置！**

---

### 第 3 步：配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://bgpeyfvgqpgsezgzqrco.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_N3tR08CEY_iXD8HcgnM-9Q_YTUfdECP
NEXT_PUBLIC_SITE_NAME=淋淋园牛羊肉
```

**添加完成后点击 "Deploy"**

---

## ✅ 部署完成！

几分钟后，你的网站就会上线：
- **生产环境**: `https://huang-lao-boss.vercel.app`
- **预览部署**: 每个分支都会自动生成预览链接

---

## 🔧 使用 CLI 部署（可选）

如果你更喜欢命令行：

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署
vercel --prod
```

---

## 📋 详细文档

完整的部署指南请查看：
- **[DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md)** - 详细部署教程
- **[.env.vercel.example](./.env.vercel.example)** - 环境变量配置指南

---

## 🎯 部署检查清单

### 部署前
- [ ] 代码已推送到 GitHub
- [ ] 所有 `.env.local` 中的变量已添加到 Vercel
- [ ] Supabase RLS 策略已正确配置
- [ ] 本地测试通过

### 部署后验证
- [ ] 访问首页正常
- [ ] 商品列表正常
- [ ] 商品详情正常
- [ ] 外卖平台链接正常
- [ ] 后台管理可访问
- [ ] 登录功能正常
- [ ] 图片正常显示
- [ ] 无控制台错误

---

## 🔍 常见问题

### Q: 构建失败怎么办？
A: 检查 Vercel 的 Build Logs，通常是缺少环境变量

### Q: 如何绑定自定义域名？
A: Settings → Domains → Add Domain，然后配置 DNS

### Q: 如何更新部署？
A: 推送到 main 分支后 Vercel 会自动重新部署

### Q: Supabase 连接失败？
A: 检查 URL 和 Anon Key 是否正确，确认 RLS 策略已配置

---

## 📞 获取帮助

- **Vercel 文档**: https://vercel.com/docs
- **Next.js 部署**: https://nextjs.org/docs/deployment
- **项目 Issues**: https://github.com/your-username/huang-lao-boss/issues

---

**最后更新**: 2026-03-30  
**部署状态**: 准备就绪 ✅
