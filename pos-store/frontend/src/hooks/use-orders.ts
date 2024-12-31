import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '@/services/order.service'

export function useOrders(filters?: any) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => orderService.getOrders(filters),
    select: (data) => ({
      orders: data.data.orders,
      total: data.data.total,
      page: data.data.page,
      pages: data.data.pages
    })
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => orderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

export function useOrder(orderNumber: string) {
  return useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => orderService.getOrder(orderNumber),
    select: (response) => response.data
  })
}