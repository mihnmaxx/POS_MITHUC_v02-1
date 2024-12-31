import apiClient from '@/lib/api-client';
import { Product, CreateProductRequest, UpdateProductRequest, BatchUpdateProductRequest, PaginatedResponse } from '@/types/api';

export const productService = {
getProducts: (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  }) =>
  apiClient.get<PaginatedResponse<Product>>('/products/', {
      params: {
      page: params?.page || 1,
      limit: params?.limit || 20,
      search: params?.search || '',
      category: params?.category || ''
      }
  }).catch(error => {
      console.error('Error fetching products:', error);
      throw error;
  }),

  getProduct: (id: string) =>
    apiClient.get<Product>(`/products/${id}`),
    
  getProductByBarcode: (barcode: string) =>
    apiClient.get<Product>(`/products/barcode/${barcode}`),
  
  createProduct: (data: CreateProductRequest) =>
    apiClient.post<Product>('/products/', data),
    
  updateProduct: (id: string, data: UpdateProductRequest) =>
    apiClient.put<Product>(`/products/${id}`, data),
    
  deleteProduct: (id: string) =>
    apiClient.delete(`/products/${id}`),
    
  batchUpdate: (data: BatchUpdateProductRequest) =>
    apiClient.post('/products/batch', data)
};
