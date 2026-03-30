# 淋淋园牛羊肉 - 农产品展示与内容管理网站

一个基于 Next.js 14 + Supabase 构建的现代化农产品品牌网站。

## 🌟 特性

- **前端**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **后端**: Supabase (PostgreSQL + Auth + Storage)
- **部署**: Vercel (前端) + Supabase (后端)
- **响应式设计**: 完美支持移动端

## 📁 项目结构

```
huang-lao-boss/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # 前台页面
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── products/      # 商品列表
│   │   │   ├── category/      # 分类页
│   │   │   ├── product/       # 商品详情
│   │   │   ├── articles/      # 文章列表
│   │   │   └── about/         # 关于我们
│   │   └── admin/             # 管理后台
│   │       ├── login/         # 登录页
│   │       ├── products/      # 商品管理
│   │       ├── categories/    # 分类管理
│   │       └── articles/      # 文章管理
│   ├── components/            # React 组件
│   │   ├── ui/               # 基础 UI 组件
│   │   └── ...               # 业务组件
│   └── lib/                  # 工具库
│       └── supabase/         # Supabase 客户端和服务
├── supabase-schema.sql       # 数据库初始化脚本
└── package.json
```

## 🚀 快速开始

### 1. 环境准备

- Node.js 18+ 
- npm 或 yarn
- Supabase 账号

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 到 `.env.local`:

```bash
cp .env.local.example .env.local
```

填写你的 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WECHAT_MINIPROGRAM_URL=你的小程序链接
NEXT_PUBLIC_MEITUAN_URL=你的美团店铺链接
NEXT_PUBLIC_ELEME_URL=你的饿了么店铺链接
```

### 4. 初始化数据库

1. 登录 [Supabase](https://supabase.com)
2. 创建新项目
3. 进入 SQL Editor
4. 运行 `supabase-schema.sql` 文件中的 SQL 语句
5. 在 Authentication → Users 中创建管理员账号

### 5. 创建 Storage Buckets

在 Supabase Storage 中创建以下 buckets:

- `products` - 商品图片
- `banners` - 轮播图
- `articles` - 文章图片
- `company` - 公司图片
- `categories` - 分类图片

**重要**: 将每个 bucket 设置为"Public"以便公开访问

### 6. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📦 核心功能

### 前台功能
- ✅ 品牌展示首页
- ✅ 产品分类浏览
- ✅ 商品详情展示
- ✅ 品牌故事/文章
- ✅ 公司介绍
- ✅ 多平台订购入口

### 后台管理
- ✅ 用户认证 (Supabase Auth)
- ✅ 商品 CRUD
- ✅ 分类管理 (支持父子分类)
- ✅ 文章管理
- ✅ 图片上传 (Supabase Storage)

## 🎨 UI 设计

配色方案:
- 主色：深绿色 (#2D5016)
- 辅助色：金色 (#D4AF37)
- 背景色：米色 (#F5E6D3)

风格特点:
- 简洁现代
- 大图展示
- 卡片式布局
- 强视觉冲击

## 🛠️ 技术亮点

1. **Server Components**: 充分利用 Next.js 服务端渲染
2. **API 封装**: 统一的数据服务层
3. **类型安全**: 完整的 TypeScript 类型定义
4. **响应式设计**: 移动端优先
5. **图片优化**: next/image 自动优化

## 📝 数据库表结构

### products
- id, name, description, price
- cover, images, category_id
- stock, unit, is_featured, status

### categories
- id, name, parent_id (支持多级分类)
- description, image_url, sort_order

### articles
- id, title, content, cover
- author, summary, views
- is_published, published_at

### banners
- id, title, image_url, link_url
- sort_order, is_active

### company_info
- id, title, content
- cover_image, gallery_images

### order_links
- id, platform, name, url
- icon_url, is_active, sort_order

## 🚢 部署

### Vercel 部署

1. 安装 Vercel CLI:
```bash
npm i -g vercel
```

2. 部署:
```bash
vercel
```

3. 按照提示操作即可

### Supabase 生产环境

1. 在 Supabase 创建生产项目
2. 更新环境变量
3. 重新运行数据库迁移脚本

## 🔐 安全考虑

- RLS (Row Level Security) 已启用
- 公开数据只读权限
- 管理员需要认证
- 图片上传有格式和大小限制

## 📄 License

MIT

## 👤 作者

淋淋园牛羊肉

---

## 💡 常见问题

### Q: 如何添加管理员？
A: 在 Supabase Dashboard → Authentication → Users 中添加用户

### Q: 图片无法显示？
A: 检查 Storage bucket 是否设置为 Public

### Q: 如何修改备案号？
A: 编辑 `src/components/footer.tsx` 文件

### Q: 如何更改订购链接？
A: 在管理后台或直接修改数据库 order_links 表
