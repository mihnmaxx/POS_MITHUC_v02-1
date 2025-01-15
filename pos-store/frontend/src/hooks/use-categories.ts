import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { categoryService } from '@/services/category.service'
import { Category } from '@/types/api'
import { fetchCategories } from '@/components/categories/CategoryList'

// Hook lấy danh sách categories
export function useCategories({
  search = '',
  limit = 8
}: {
  search?: string;
  limit?: number;
} = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['categories', search],
    queryFn: ({ pageParam = 1 }) => fetchCategories({ search, page: pageParam as number, limit }),
    getNextPageParam: (lastPage: { categories: any[] }, pages) => {
      if (lastPage.categories.length < limit) return undefined
      return pages.length + 1
    },
    initialPageParam: 1
  })

  const categories = data?.pages.flatMap(page => page.categories) || []

  return {
    data: { categories },
    isLoading,
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
    isLoadingMore: isFetchingNextPage
  }
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
