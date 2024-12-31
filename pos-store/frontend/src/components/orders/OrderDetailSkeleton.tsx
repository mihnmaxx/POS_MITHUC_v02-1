import { Skeleton } from '@/components/ui/skeleton'

export function OrderDetailSkeleton() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div>
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    )
  }
  