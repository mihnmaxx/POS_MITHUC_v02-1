'use client'

import { ProductForm } from '@/components/products/ProductForm'
import { useCreateProduct } from '@/hooks/use-products'
import { useRouter } from 'next/navigation'

export default function NewProductPage() {
  const router = useRouter()
  const { mutate: createProduct } = useCreateProduct()

  const handleSubmit = async (data: any) => {
    try {
      await createProduct(data)
      router.push('/products')
    } catch (error) {
      console.error('Failed to create product:', error)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Thêm sản phẩm mới</h1>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  )
}
