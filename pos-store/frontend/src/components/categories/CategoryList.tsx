import { useCategories } from '@/hooks/use-categories'
import { Skeleton } from '../ui/skeleton'
import { CategoryCard } from './CategoryCard'

interface CategoryListProps {
  searchTerm: string
}

export function CategoryList({ searchTerm }: CategoryListProps) {
  const { data, isLoading } = useCategories({
    search: searchTerm
  })
  console.log('CategoryList data:', data)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-[200px]">
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {data?.categories.map((category) => (
        <div key={category._id} className="h-[130px]">
          <CategoryCard
            category={category}
            className="w-full h-full"
          />
        </div>
      ))}
    </div>
  )
}
