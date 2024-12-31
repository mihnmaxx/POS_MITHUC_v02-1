import apiClient from '@/lib/api-client';
import { Order, CreateOrderRequest, PaginatedResponse } from '@/types/api';

export const orderService = {
  getOrders: (params?: { status?: string; customer_id?: string; start_date?: string; end_date?: string; page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Order>>('/orders/', { params }),
    
  getOrder: async (orderNumber: string) => {
    console.log('Calling API:', `/orders/number/${orderNumber}`)
    const response = await apiClient.get(`/orders/number/${orderNumber}`)
    return response
  },

  createOrder: (data: any) =>
    apiClient.post<Order>('/orders/', data),
    
  updateOrderStatus: (orderNumber: string, status: string) =>
    apiClient.put(`/orders/number/${orderNumber}/status`, { status }),
    
  voidOrder: (orderNumber: string) =>
    apiClient.post(`/orders/number/${orderNumber}/void`)
};
