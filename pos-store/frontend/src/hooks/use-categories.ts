import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/category.service'
import { UpdateCategoryRequest } from '@/types/api'

// Hook lấy danh sách categories
export function useCategories(params?: any) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryService.getCategories(params),
    select: (data) => data.data
  })
}

// Hook lấy một category theo id
export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const response = await categoryService.getCategory(id)
      return response.data
    },
    enabled: !!id
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Category>) => {
      return categoryService.createCategory(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => {
      console.log('Mutation error:', error)
    }
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Category>) => {
      console.log('Sending update:', { id, data })
      return categoryService.updateCategory(id, data)
    },
    onSuccess: (data, variables) => {
      // Cập nhật cache ngay lập tức
      queryClient.setQueryData(['category', variables.id], data)
      
      // Cập nhật danh sách categories
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      
      // Log kết quả
      console.log('Update successful:', data)
    }
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}