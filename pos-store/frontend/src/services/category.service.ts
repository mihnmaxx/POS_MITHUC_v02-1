import apiClient from '@/lib/api-client';
import { Category } from '@/types/api';

export const categoryService = {
  getCategories: (params?: any) => 
    apiClient.get('/category/', { params }),

  getCategory: (id: string) => 
    apiClient.get(`/category/${id}`),
    
  createCategory: (data: Partial<Category>) => 
    apiClient.post('/category/', data),

  updateCategory: async ( id: string, data: Partial<Category>) => {
    const response = await apiClient.put(`/category/${id}`, data)
    console.log('Response:', response)
    return response.data
  },

  deleteCategory: (id: string) => 
    apiClient.delete(`/category/${id}`)
};
