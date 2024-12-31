import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Category } from "@/types/api"
import { cn } from "@/lib/utils"
import { Edit, Trash } from "lucide-react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useDeleteCategory } from "@/hooks/use-categories"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface CategoryCardProps {
  category: Category
  className?: string
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const router = useRouter()
  const { mutateAsync: deleteCategory, isLoading } = useDeleteCategory()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const handleDelete = async () => {
    try {
      await deleteCategory(category._id)
      toast.success('Xóa danh mục thành công')
      setShowDeleteDialog(false)
      router.refresh()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa danh mục')
    }
  }

  return (
    <Card className={cn("group hover:border-primary transition-colors", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold">{category.name}</h3>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push(`/categories/edit/${category._id}`)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-destructive"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận xoá</DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn xoá danh mục này?
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Huỷ
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Xoá
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {category.parent_id && (
          <p className="text-sm text-muted-foreground">
            Danh mục cha: {category.parent_id}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
