'use client'

import { CategoryList } from '@/components/categories/CategoryList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CategoriesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Danh mục</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Button onClick={() => router.push('/categories/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm danh mục
          </Button>
        </div>
      </div>
      <CategoryList searchTerm={searchTerm} />
    </div>
  )
}