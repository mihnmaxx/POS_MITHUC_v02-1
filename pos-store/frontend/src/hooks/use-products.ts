import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '@/services/product.service'
import { Product, ProductResponse, CreateProductRequest, UpdateProductRequest } from '@/types/api'

export function useProducts(params?: any) {
    return useQuery<ProductResponse>({
        queryKey: ['products', params],
        queryFn: async () => {
          try {
            const response = await productService.getProducts(params)
            return {
              products: response.data.products,
              total: response.data.total,
              page: response.data.page,
              pages: response.data.pages
            }
          } catch (error) {
            throw new Error('Failed to fetch products')
          }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        retryDelay: 1000
      })
      
}export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ['products', id],
    queryFn: async () => {
      const response = await productService.getProduct(id)
      return response.data
    },
    enabled: !!id
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const response = await productService.createProduct(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: string } & Partial<Product>) => productService.updateProduct(data.id, data),    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}
