import { ProductCard } from './ProductCard'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { Product } from '@/types/api'

interface ProductListProps {
  data: Product[];
  isLoading: boolean;
}

export function ProductList({ data, isLoading }: ProductListProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="h-[300px]">
            <CardHeader>
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-[180px] w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-150px)] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((product) => (
          <ProductCard 
            key={product._id}
            product={product}
            onClick={() => router.push(`/products/view/${product._id}`)}
          />
        ))}
      </div>
    </div>
  )
}
