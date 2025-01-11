'use client'

import { ProductList } from '@/components/products/ProductList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useProducts } from '@/hooks/use-products'
import { Product } from '@/types/api'


export default function ProductsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [allProducts, setAllProducts] = useState<Product[]>([])

  const { data, isLoading } = useProducts({
    search: searchTerm,
    page: page
  })

  useEffect(() => {
    if (data?.products) {
      setAllProducts(prev => [...prev, ...data.products] as Product[])
    }
  }, [data])

  const loadMore = () => {
    setPage(prevPage => prevPage + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Button onClick={() => router.push('/products/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>
      <ProductList data={allProducts} isLoading={isLoading} />
      <div className="flex justify-center">
        <Button variant="outline" onClick={loadMore}>
          Xem thêm
        </Button>
      </div>
    </div>
  )
}