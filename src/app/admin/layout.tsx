'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // 检查用户登录状态（带超时）
    const checkUser = async () => {
      try {
        // 设置超时
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('认证超时')), 5000)
        })
        
        const sessionPromise = supabase.auth.getSession()
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any
        
        if (error) {
          console.error('Session error:', error)
          setAuthError('认证失败：' + error.message)
          router.push('/admin/login')
          return
        }
        
        if (!session) {
          console.log('No session found, redirecting to login')
          router.push('/admin/login')
          return
        }

        setUser(session.user)
        setAuthError(null)
      } catch (error: any) {
        console.error('Auth check failed:', error)
        setAuthError(error.message || '认证检查失败')
        router.push('/admin/login')
        return
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event)
      if (!session) {
        router.push('/admin/login')
      } else {
        setUser(session.user)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...
          {authError && (
            <div className="text-red-600 text-sm mt-2">
              {authError}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user?.email}
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* 侧边栏 */}
          <aside className="space-y-2">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/admin" 
                className="px-4 py-2 rounded-lg hover:bg-brand-cream/30 transition-colors"
              >
                概览
              </Link>
              <Link 
                href="/admin/products" 
                className="px-4 py-2 rounded-lg hover:bg-brand-cream/30 transition-colors"
              >
                商品管理
              </Link>
              <Link 
                href="/admin/categories" 
                className="px-4 py-2 rounded-lg hover:bg-brand-cream/30 transition-colors"
              >
                分类管理
              </Link>
              <Link 
                href="/admin/articles" 
                className="px-4 py-2 rounded-lg hover:bg-brand-cream/30 transition-colors"
              >
                文章管理
              </Link>
              <div className="pt-2 border-t"></div>
              <Link 
                href="/admin/banners" 
                className="px-4 py-2 rounded-lg hover:bg-brand-cream/30 transition-colors"
              >
                轮播图管理
              </Link>
              <Link 
                href="/admin/settings" 
                className="px-4 py-2 rounded-lg hover:bg-brand-cream/30 transition-colors"
              >
                网站配置
              </Link>
              <div className="pt-2 border-t"></div>
              <Link 
                href="/" 
                target="_blank"
                className="px-4 py-2 rounded-lg hover:bg-brand-cream/30 transition-colors"
              >
                查看网站 →
              </Link>
            </nav>
          </aside>

          {/* 主内容区 */}
          <main className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-8rem)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
