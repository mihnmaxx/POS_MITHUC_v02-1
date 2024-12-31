'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useCreateCategory } from '@/hooks/use-categories'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function CategoryForm() {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      color: '#000000',
    },
  })

  const { mutateAsync: createCategory, isLoading } = useCreateCategory()

  async function onSubmit(values: FormValues) {
    try {
      await createCategory({
        name: values.name,
        description: values.description,
        icon: values.icon,
        color: values.color
      })
      toast.success('Tạo danh mục thành công')
      router.push('/categories')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Có lỗi xảy ra khi tạo danh mục')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin danh mục</CardTitle>
            <CardDescription>
              Nhập thông tin chi tiết cho danh mục mới
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên danh mục" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập mô tả danh mục" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Input placeholder="Chọn icon cho danh mục" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Màu sắc</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Đang tạo...' : 'Tạo danh mục'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
