'use client'

import { useProduct, useUpdateProduct } from '@/hooks/use-products'
import { useParams, useRouter } from 'next/navigation'
import { EditProductForm } from '@/components/products/EditProductForm'

export default function EditProductPage() {
  const { id } = useParams()
  const { data: product, isLoading } = useProduct(id as string)
  const updateProduct = useUpdateProduct()
  const router = useRouter()

  if (isLoading) return <div>Loading...</div>

  if (!product) return <div>Product not found</div>

  const handleUpdate = async (data: any) => {
    await updateProduct.mutateAsync({
      id,
      ...data
    })
    router.push('/products')
  }

  return (
    <EditProductForm 
      product={product}
      onSubmit={handleUpdate}
    />
  )
}
