import { Product } from '@/types/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { uploadService } from '@/services/upload.service'
import { useTheme } from 'next-themes'

interface ProductCardProps {
  product: Product
  onClick?: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const { theme } = useTheme()

  const getDefaultImage = () => {
    return theme === 'dark'
    ? '/images/default-product-dark.png'
    : '/images/default-product-light.png'
  }

  const getProductImage = () => {
    if (!product.image_url) return getDefaultImage()
    const imageUrl = uploadService.getImageUrl(product.image_url)
    return imageUrl ?? getDefaultImage()
  }

  return (
    <Card className="cursor-pointer hover:bg-muted/50" onClick={onClick}>
      <div className="aspect-square w-full relative">
        <img 
          src={getProductImage()}
          alt={product.name}
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="font-semibold">{product.name}</div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <span>Giá bán:</span>
          <span className="font-medium">{formatCurrency(product.price)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tồn kho:</span>
          <span>{product.stock_quantity} {product.unit}</span>
        </div>
      </CardContent>
    </Card>
  )
}
