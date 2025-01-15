import { useCategories } from '@/hooks/use-categories'
import { Skeleton } from '../ui/skeleton'
import { CategoryCard } from './CategoryCard'
import { Category } from '@/types/api'
import { Button } from '../ui/button'
import { categoryService } from '@/services/category.service'

interface CategoryListProps {
  searchTerm: string
}

export function CategoryList({ searchTerm }: CategoryListProps) {
  const { data, isLoading, hasMore, loadMore, isLoadingMore } = useCategories({
    search: searchTerm,
    limit: 8
  })
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-[130px]">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.categories.map((category: Category) => (
          <div key={category._id} className="h-[130px]">
            <CategoryCard
              category={category}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
      
      {isLoadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`loading-${index}`} className="h-[130px]">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div className="flex justify-center">
          <Button 
            onClick={() => loadMore()}
            disabled={isLoadingMore}
            variant="outline"
          >
            {isLoadingMore ? 'Đang tải...' : 'Tải thêm'}
          </Button>
        </div>
      )}
    </div>
  )
}

export async function fetchCategories({ 
  search = '', 
  page = 1, 
  limit = 8 
}: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await categoryService.getCategories({
    search,
    page,
    limit
  })
  return response.data
}