import apiClient from '@/lib/api-client';
import { Payment, PaymentMethod } from '@/types/api';

export const paymentService = {
  getPaymentMethods: (params?: { active_only?: boolean; type?: string }) =>
    apiClient.get<PaymentMethod[]>('/payment/methods', { params }),
    
  processPayment: (orderNumber: string, data: { amount: number, method: string }) =>
    apiClient.post<Payment>(`/payment/order/${orderNumber}/process`, data),
    
  verifyPayment: (orderNumber: string, data: any) =>
    apiClient.post(`/payment/order/${orderNumber}/verify`, data),
    
  refundPayment: (orderNumber: string, data: any) =>
    apiClient.post(`/payment/order/${orderNumber}/refund`, data)
};
