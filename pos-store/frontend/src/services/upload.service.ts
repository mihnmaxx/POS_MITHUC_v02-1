import apiClient from '@/lib/api-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const uploadService = {
  uploadProductImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post('/upload/product-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  getImageUrl: (fileId: string) => {
    if (!fileId) return null
    return `${API_URL}/upload/files/${fileId}`
  }
}

