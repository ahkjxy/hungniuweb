'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ImageUploaderProps {
  value?: string | null
  onChange: (url: string) => void
  bucket: string // 'products' | 'categories' | 'banners' | 'articles' | 'company'
  label?: string
  aspectRatio?: 'square' | 'video' | 'custom'
  width?: number
  height?: number
}

export function ImageUploader({ 
  value, 
  onChange, 
  bucket, 
  label = '封面图片',
  aspectRatio = 'square',
  width = 200,
  height = 200
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('只支持 JPG、PNG、WebP 格式的图片')
      }

      // 验证文件大小（最大 5MB）
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('图片大小不能超过 5MB')
      }

      // 生成文件名
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      // 上传图片
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      onChange(publicUrl)
      alert('图片上传成功！')
    } catch (err: any) {
      console.error('Upload failed:', err)
      setError(err.message || '图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    onChange('')
    setError(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{label}</label>
        {uploading && (
          <span className="text-xs text-muted-foreground">上传中...</span>
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          className="flex-1 text-sm"
        />
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
          >
            移除
          </Button>
        )}
      </div>

      {/* 图片预览 */}
      {value && (
        <div className="relative mt-2 rounded-lg overflow-hidden border bg-muted">
          <div 
            className="relative"
            style={{
              width: '100%',
              maxWidth: `${width}px`,
              aspectRatio: aspectRatio === 'custom' ? `${width}/${height}` : aspectRatio === 'video' ? '16/9' : '1/1'
            }}
          >
            <Image
              src={value}
              alt="预览"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* 提示信息 */}
      <p className="text-xs text-muted-foreground">
        支持 JPG、PNG、WebP 格式，最大 5MB
      </p>
    </div>
  )
}
