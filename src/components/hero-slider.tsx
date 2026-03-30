'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/database.types'
import { ContentService } from '@/lib/supabase/content'

type Banner = Database['public']['Tables']['banners']['Row']

export function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    async function loadBanners() {
      try {
        const data = await ContentService.getBanners()
        setBanners(data || [])
      } catch (error) {
        console.error('Failed to load banners:', error)
      }
    }
    loadBanners()
  }, [])

  useEffect(() => {
    if (banners.length === 0) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) {
    return (
      <div className="relative h-[400px] md:h-[600px] bg-brand-beige animate-pulse" />
    )
  }

  return (
    <div className="relative h-[400px] md:h-[600px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {banner.image_url ? (
            <Image
              src={banner.image_url}
              alt={banner.title || 'Banner'}
              fill
              className="object-cover"
              priority={index === 0}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-brand-green to-brand-beige" />
          )}
          
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* 标题 */}
          {banner.title && (
            <div className="absolute bottom-20 left-0 right-0 text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {banner.title}
              </h2>
            </div>
          )}
        </div>
      ))}

      {/* 指示器 */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
