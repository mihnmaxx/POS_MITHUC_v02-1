import { Product } from '@/types/api'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { uploadService } from '@/services/upload.service'

interface ProductDetailProps {
  product: Product
  onEdit: () => void
}

export function ProductDetail({ product, onEdit }: ProductDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <Button onClick={onEdit}>Sửa sản phẩm</Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-lg overflow-hidden border">
            <img 
              src={product.image_url ? uploadService.getImageUrl(product.image_url) : '/placeholder-product.png'} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Mã vạch: {product.barcode}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="font-semibold mb-2">Thông tin cơ bản</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Giá bán:</span>
                <span className="font-medium">{formatCurrency(product.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Đơn vị:</span>
                <span>{product.unit}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Thông tin tồn kho</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tồn kho:</span>
                <span>{product.stock_quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Tồn tối thiểu:</span>
                <span>{product.min_stock_level}</span>
              </div>
              <div className="flex justify-between">
                <span>Tồn tối đa:</span>
                <span>{product.max_stock_level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
