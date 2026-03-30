import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">欢迎使用管理后台</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 快捷操作卡片 */}
        <div className="p-6 bg-gradient-to-br from-brand-green to-brand-green/80 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-2">📦 商品管理</h2>
          <p className="text-white/80 mb-4">添加、编辑、删除商品信息</p>
          <a href="/admin/products" className="inline-block bg-white text-brand-green px-4 py-2 rounded hover:bg-white/90 transition-colors">
            进入管理 →
          </a>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-2">🏷️ 分类管理</h2>
          <p className="text-white/80 mb-4">管理产品分类和层级结构</p>
          <a href="/admin/categories" className="inline-block bg-white text-blue-600 px-4 py-2 rounded hover:bg-white/90 transition-colors">
            进入管理 →
          </a>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-2">📝 文章管理</h2>
          <p className="text-white/80 mb-4">发布和编辑品牌故事</p>
          <a href="/admin/articles" className="inline-block bg-white text-orange-600 px-4 py-2 rounded hover:bg-white/90 transition-colors">
            进入管理 →
          </a>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-12 p-6 bg-brand-beige/30 rounded-lg">
        <h3 className="text-lg font-bold mb-4">💡 快速开始</h3>
        <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
          <li>首次使用请先在 Supabase 控制台创建用户</li>
          <li>使用左侧菜单导航到相应管理页面</li>
          <li>点击&quot;添加&quot;按钮创建新内容</li>
          <li>编辑或删除现有内容</li>
        </ol>
      </div>
    </div>
  )
}
