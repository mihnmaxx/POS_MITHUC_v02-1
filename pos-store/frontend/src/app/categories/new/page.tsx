'use client'

import { CategoryForm } from '@/components/categories/CategoryForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NewCategoryPage() {
  const router = useRouter()

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold">Thêm danh mục mới</h1>
      </div>

      <div className="space-y-6">
        <CategoryForm />
      </div>
    </div>
  )
}
