import { productService } from '@/services/product.service'

export class ProductCache {
  private offlineProducts: Map<string, any> = new Map()

  async getProduct(barcode: string) {
    const cachedProduct = this.offlineProducts.get(barcode)
    if (cachedProduct) return cachedProduct

    try {
      const response = await productService.getProductByBarcode(barcode)
      // Trả về trực tiếp response.data
      if (response.data) {
        this.offlineProducts.set(barcode, response.data)
        return response.data
      }
      return null
    } catch (error) {
      return null
    }
  }

  getOfflineProduct(barcode: string) {
    return this.offlineProducts.get(barcode) || null
  }
}
