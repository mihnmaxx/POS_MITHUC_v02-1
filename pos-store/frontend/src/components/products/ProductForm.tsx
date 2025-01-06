import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Product } from '@/types/api'
import { Camera, Upload } from 'lucide-react'
import { useState, useRef } from 'react'
import { uploadService } from '@/services/upload.service'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { useCategories } from '@/hooks/use-categories'
import { useCreateProduct } from '@/hooks/use-products'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: any) => Promise<void>
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit }) => {
  const { data } = useCategories()
  const router = useRouter()
  const { mutate: createProduct } = useCreateProduct()
  const categories = data?.categories // Lấy mảng categories từ response
  const { register, watch, setValue, handleSubmit } = useForm({
    defaultValues: product || {
      name: '',
      barcode: '',
      description: '',
      category_id: '',
      price: 0,
      cost_price: 0,
      unit: '',
      image_url: '',
      stock_quantity: 0,
      min_stock_level: 0,
      max_stock_level: 0,
      is_active: true
    }
  })
  const [tempImage, setTempImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>(product?.image_url ? uploadService.getImageUrl(product.image_url) || '/placeholder-product.png' : '/placeholder-product.png')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showCamera, setShowCamera] = useState(false)


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setTempImage(file)
      // Tạo URL tạm thời để preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
    }
  }

  const handleFormSubmit = handleSubmit(async (data: any) => {
    try {
      if (tempImage) {
        const response = await uploadService.uploadProductImage(tempImage)
        data.image_url = response.file_id
      }
      
      // Gọi API tạo sản phẩm
      await createProduct(data)
      console.log('Product created successfully')

      router.push('/products')
      
    } catch (error) {
      console.error('Error creating product:', error)
    }
  })  

  const startCamera = async () => {
    try {
      console.log('Bắt đầu truy cập camera...')
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Trình duyệt không hỗ trợ truy cập camera.')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
        facingMode: 'environment'
        }
      })
      console.log('Đã truy cập camera thành công.')
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Thêm các event handlers
        videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata đã tải xong')
        }
        
        videoRef.current.oncanplay = () => {
            console.log('Video sẵn sàng để phát')
        }
        
        videoRef.current.onplay = () => {
            console.log('Video đã bắt đầu phát')
            setShowCamera(true)
        }
        
        videoRef.current.onerror = (e) => {
            console.log('Lỗi video:', e)
        }

        videoRef.current.play()
      }
    } catch (err) {
      console.error('Không thể truy cập camera:', err)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas')
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(videoRef.current, 0, 0)
        
        // Chuyển canvas thành file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
            setTempImage(file)
            setPreview(URL.createObjectURL(blob))
          }
        }, 'image/jpeg')
        
        stopCamera()
      }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream
    stream?.getTracks().forEach(track => track.stop())
    setShowCamera(false)
  }

    return (
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input 
                id="name"
                {...register('name')}
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="barcode">Mã vạch</Label>
              <Input 
                id="barcode"
                {...register('barcode')}
                placeholder="Nhập mã vạch"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea 
                id="description"
                {...register('description')}
                placeholder="Nhập mô tả sản phẩm"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Danh mục</Label>
              <Select onValueChange={(value) => setValue('category_id', value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category: { _id: string; name: string }) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Giá bán</Label>
              <Input 
                id="price"
                type="number" 
                {...register('price')}
                placeholder="Nhập giá bán"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cost_price">Giá vốn</Label>
              <Input 
                id="cost_price"
                type="number"
                {...register('cost_price')}
                placeholder="Nhập giá vốn"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">Đơn vị tính</Label>
              <Input 
                id="unit"
                {...register('unit')}
                placeholder="Nhập đơn vị tính"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stock_quantity">Số lượng tồn</Label>
              <Input 
                id="stock_quantity"
                type="number"
                {...register('stock_quantity')}
                placeholder="Nhập số lượng tồn"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="min_stock_level">Tồn tối thiểu</Label>
              <Input 
                id="min_stock_level"
                type="number"
                {...register('min_stock_level')}
                placeholder="Nhập tồn tối thiểu"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="max_stock_level">Tồn tối đa</Label>
              <Input 
                id="max_stock_level"
                type="number"
                {...register('max_stock_level')}
                placeholder="Nhập tồn tối đa"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Kích hoạt</Label>
            </div>
          </div>
        
          <div className="space-y-4">
            <div className="aspect-square border rounded-lg overflow-hidden">
              {showCamera && (
                <div className="relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <Button onClick={capturePhoto}>Chụp ảnh</Button>
                    <Button variant="outline" onClick={stopCamera}>Hủy</Button>
                  </div>
                </div>
              )}
              {!showCamera && (
                preview ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    Chưa có ảnh
                  </div>
                )
              )}
            </div>
          
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Tải ảnh lên
              </Button>
            
              <Button 
                type="button" 
                variant="outline"
                onClick={showCamera ? capturePhoto : startCamera}
              >
                <Camera className="w-4 h-4 mr-2" />
                {showCamera ? 'Chụp ảnh' : 'Mở camera'}
              </Button>
            
              {showCamera && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={stopCamera}
                >
                  Đóng camera
                </Button>
              )}
            </div>
          
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          {product ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </form>
    )
}