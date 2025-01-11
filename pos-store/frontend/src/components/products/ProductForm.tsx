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
import { useCategories } from '@/hooks/use-categories'
import { useCreateProduct } from '@/hooks/use-products'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  barcode: z.string().min(1, "Barcode là bắt buộc"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  price: z.number().min(0, "Giá bán phải lớn hơn 0"),
  cost_price: z.number().min(0, "Giá vốn phải lớn hơn 0"),
  unit: z.string().min(1, "Đơn vị tính là bắt buộc"),
  stock_quantity: z.number().min(0, "Số lượng tồn phải lớn hơn 0"),
  min_stock_level: z.number().min(0),
  max_stock_level: z.number().min(0),
  is_active: z.boolean().default(true)
})

interface ProductFormProps {
  product?: Product
  onSubmit: (data: any) => Promise<void>
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit }) => {
  const { data } = useCategories()
  const router = useRouter()
  const { mutate: createProduct } = useCreateProduct()
  const categories = data?.categories // Lấy mảng categories từ response
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: product || {
      name: '',
      barcode: '',
      description: '',
      category_id: '',
      price: 0,
      cost_price: 0,
      unit: '',
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

  const onSubmitForm = async (data: z.infer<typeof formSchema>) => {
    try {
      let updatedData = { 
        ...data,
        price: Number(data.price),
        cost_price: Number(data.cost_price),
        stock_quantity: Number(data.stock_quantity),
        min_stock_level: Number(data.min_stock_level),
        max_stock_level: Number(data.max_stock_level)
      } as z.infer<typeof formSchema> & { image_url?: string }
      if (tempImage) {
        const response = await uploadService.uploadProductImage(tempImage)
        updatedData.image_url = response.file_id
      }
      await createProduct(updatedData)
      router.push('/products')
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sản phẩm</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập tên sản phẩm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã vạch (Barcode)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập mã vạch" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Nhập mô tả sản phẩm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: { _id: string; name: string }) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá bán</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="Nhập giá bán" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá vốn</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="Nhập giá vốn" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị tính</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập đơn vị tính" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng tồn</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="Nhập số lượng tồn" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tồn tối thiểu</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="Nhập tồn tối thiểu" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tồn tối đa</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="Nhập tồn tối đa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Kích hoạt</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
      </Form>
    )
}