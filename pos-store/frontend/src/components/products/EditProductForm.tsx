'use client'

import { useForm } from 'react-hook-form'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Product } from '@/types/api'
import { useState } from 'react'
import { uploadService } from '@/services/upload.service'
import { useCategories } from '@/hooks/use-categories'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface EditProductFormProps {
  product: Product
  onSubmit: (data: any) => void
}

export function EditProductForm({ product, onSubmit }: EditProductFormProps) {
  const { data: categoriesData } = useCategories()
  const [preview, setPreview] = useState(product.image_url 
    ? uploadService.getImageUrl(product.image_url)
    : null
  )
  const [tempImage, setTempImage] = useState<File>()

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      name: product.name,
      barcode: product.barcode,
      description: product.description,
      category_id: product.category_id,
      price: product.price,
      cost_price: product.cost_price,
      unit: product.unit,
      stock_quantity: product.stock_quantity,
      min_stock_level: product.min_stock_level,
      max_stock_level: product.max_stock_level,
      is_active: product.is_active
    }
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setTempImage(file)
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
    }
  }

  const handleFormSubmit = handleSubmit(async (data: any) => {
    try {
      let imageUrl = product.image_url
  
      // Upload ảnh mới nếu có
      if (tempImage) {
        const uploadResponse = await uploadService.uploadProductImage(tempImage)
        imageUrl = uploadResponse.file_id
      }
  
      // Gộp dữ liệu form và ảnh
      await onSubmit({
        id: product._id,
        ...data,
        image_url: imageUrl
      })
    } catch (error) {
      console.error('Update failed:', error)
    }
  })  

  return (
    <form onSubmit={handleFormSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Tên sản phẩm</Label>
                <Input {...register('name')} />
              </div>

              <div>
                <Label>Mã vạch</Label>
                <Input {...register('barcode')} />
              </div>

              <div>
                <Label>Danh mục</Label>
                <Select 
                  defaultValue={product.category_id}
                  onValueChange={(value) => setValue('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.categories.map((category: { _id: string; name: string }) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Giá bán</Label>
                <Input type="number" {...register('price')} />
              </div>

              <div>
                <Label>Giá vốn</Label>
                <Input type="number" {...register('cost_price')} />
              </div>

              <div>
                <Label>Đơn vị tính</Label>
                <Input {...register('unit')} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Số lượng tồn</Label>
                <Input type="number" {...register('stock_quantity')} />
              </div>

              <div>
                <Label>Tồn kho tối thiểu</Label>
                <Input type="number" {...register('min_stock_level')} />
              </div>

              <div>
                <Label>Tồn kho tối đa</Label>
                <Input type="number" {...register('max_stock_level')} />
              </div>

              <div>
                <Label>Mô tả</Label>
                <Textarea {...register('description')} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={watch('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
                <Label>Đang kinh doanh</Label>
              </div>

              <div>
                <Label>Hình ảnh</Label>
                <Input type="file" onChange={handleFileChange} />
                {preview && (
                  <div className="mt-2 relative aspect-square w-full rounded-lg overflow-hidden">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Cập nhật</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
