'use client'

import { useState } from 'react'
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
  const { data: categoriesData } = useCategories()
  const { data: productsData, isLoading } = useProducts({
    search: searchTerm,
    category: selectedCategory !== 'all' ? selectedCategory : undefined
  })

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
          <TabsList className="w-full flex mb-4 overflow-x-auto [&::-webkit-scrollbar]{display:none} [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsTrigger value="all" className="flex-1">Tất cả</TabsTrigger>
            {categoriesData?.categories?.map((category: { _id: string; name: string }) => (
              <TabsTrigger 
                key={category._id} 
                value={category._id}
                className="flex-1"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-[320px]">
                    <Skeleton className="h-full w-full" />
                  </div>
                ))
              ) : (
                productsData?.products.map((product) => (
                  <div key={product._id} className="h-[320px]">
                    <ProductCard
                      product={product}
                      onClick={() => onProductSelect(product)}
                    />
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
