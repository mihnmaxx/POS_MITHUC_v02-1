'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '../ui/skeleton'
import { Product } from '@/types/api'
import { useProducts } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { ProductCard } from '../products/ProductCard'

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void
}

export function ProductSelector({ onProductSelect }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [allProducts, setAllProducts] = useState<Product[]>([])

  const { data: categoriesData } = useCategories()
  const { data: productsData, isLoading } = useProducts({
    search: searchTerm,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    page: page
  })

  // Reset dữ liệu khi thay đổi tìm kiếm hoặc danh mục
  useEffect(() => {
    setPage(1)
    setAllProducts([])
  }, [searchTerm, selectedCategory])

  // Cập nhật danh sách sản phẩm
  useEffect(() => {
    if (productsData?.products) {
      if (page === 1) {
        setAllProducts(productsData.products)
      } else {
        setAllProducts(prev => [...prev, ...productsData.products])
      }
    }
  }, [productsData, page])

  const loadMore = () => {
    setPage(prev => prev + 1)
  }


  return (
    <div className="w-full bg-card border border-border rounded-lg">
      <div className="w-full p-4">
        <Input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-4"
        />
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full flex mb-4 overflow-x-auto flex-nowrap [&::-webkit-scrollbar]{display:none} [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsTrigger value="all" className="flex-1">Tất cả</TabsTrigger>
            {categoriesData?.categories?.map((category) => (
              <TabsTrigger 
                key={category._id} 
                value={category._id}
                className="flex-1 whitespace-nowrap"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="w-full h-[calc(100vh-200px)] overflow-y-auto">
            <div className="container mx-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="flex-shrink-0 h-[320px] my-2">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ))
                ) : (
                  allProducts.map((product) => (
                    <div key={product._id} className="flex-shrink-0 h-[320px] my-2">
                      <ProductCard
                        product={product}
                        onClick={() => onProductSelect(product)}
                      />
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-center py-4 sticky bottom-0">
                <Button variant="outline" onClick={loadMore}>
                  Xem thêm
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
