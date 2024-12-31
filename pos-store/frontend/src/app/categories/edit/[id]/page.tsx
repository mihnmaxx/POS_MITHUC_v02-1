'use client'

import { EditCategoryForm } from '@/components/categories/EditCategoryForm'
import { Button } from '@/components/ui/button'
import { useCategory } from '@/hooks/use-categories'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const { data: category, isLoading } = useCategory(params.id as string)

  console.log('Params', params)
  console.log('Category data', category)

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold">Chỉnh sửa danh mục</h1>
      </div>

      {category && <EditCategoryForm category={category} />}
    </div>
  )
}