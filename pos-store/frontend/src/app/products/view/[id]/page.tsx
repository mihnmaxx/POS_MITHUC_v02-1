'use client'

import { useProduct, useProducts } from '@/hooks/use-products'
import { useCategories } from '@/hooks/use-categories'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadService } from '@/services/upload.service'
import { useTheme } from 'next-themes'
import { formatCurrency } from '@/lib/utils'
import { ProductCard } from '@/components/products/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PencilIcon } from 'lucide-react'


export default function ProductViewPage() {
  const { id } = useParams()
  const { data: product, isLoading: isLoadingProduct } = useProduct(id as string)
  const { theme } = useTheme()
  const { data: productsData, isLoading: isLoadingProducts } = useProducts()
  const { data: categoriesData } = useCategories()
  const router = useRouter()

  const getDefaultImage = () => {
    return theme === 'dark' 
      ? '/images/default-product-dark.png'
      : '/images/default-product-light.png'
  }

  const getProductImage = () => {
    if (!product?.image_url) return getDefaultImage()
    return uploadService.getImageUrl(product.image_url)
  }

  const relatedProducts = productsData?.products
    ?.filter(p => p._id !== id && p.category_id === product?.category_id)
    ?.slice(0, 4)

  const category = categoriesData?.categories?.find(
    cat => cat._id === product?.category_id
  )

    if (isLoadingProduct || isLoadingProducts) {
        return (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-[200px]" />
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <Skeleton className="aspect-square rounded-lg" />
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </CardContent>
              </Card>
        
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-[180px]" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        }
    
  return (
    <div className="space-y-6">
      {/* Phần chi tiết sản phẩm */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chi tiết sản phẩm</CardTitle>
          <Button
            onClick={() => router.push(`/products/edit/${product?._id}`)}
            variant="outline"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <img
              src={getProductImage()}
              alt={product?.name}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-muted-foreground">Tên sản phẩm</h3>
              <p className="text-2xl font-semibold">{product?.name}</p>
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground">Mã vạch</h3>
              <p>{product?.barcode || 'Chưa có mã vạch'}</p>
            </div>

            <div>
                <h3 className="font-medium text-muted-foreground">Danh mục</h3>
                <p>{category?.name || 'Chưa phân loại'}</p>
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground">Giá bán</h3>
              <p className="text-xl font-semibold">{formatCurrency(product?.price || 0)}</p>
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground">Giá vốn</h3>
              <p>{formatCurrency(product?.cost_price || 0)}</p>
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground">Tồn kho</h3>
              <p>{product?.stock_quantity || 0} {product?.unit}</p>
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground">Mô tả</h3>
              <p className="text-muted-foreground">{product?.description || 'Chưa có mô tả'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Phần gợi ý sản phẩm */}
      {relatedProducts && relatedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm tương tự</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}