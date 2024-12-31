import { useQuery, useMutation } from '@tanstack/react-query'
import { paymentService } from '@/services/payment.service'

export function usePaymentMethods(params?: any) {
  return useQuery({
    queryKey: ['payment-methods', params],
    queryFn: () => paymentService.getPaymentMethods(params)
  })
}

export function useProcessPayment() {
  return useMutation({
    mutationFn: (params: { orderNumber: string; data: any }) => 
      paymentService.processPayment(params.orderNumber, params.data)
  })
}
