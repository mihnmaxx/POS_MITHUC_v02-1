export class ProductCache {
    private cache: Map<string, Product> = new Map()
  
    async getProduct(barcode: string): Promise<Product> {
      if (this.cache.has(barcode)) {
        return this.cache.get(barcode)!
      }
  
      try {
        const product = await fetch(`/api/products/${barcode}`).then(res => res.json())
        this.cache.set(barcode, product)
        return product
      } catch (error) {
        // Fallback to offline data if available
        const offlineProduct = await this.getOfflineProduct(barcode)
        if (offlineProduct) return offlineProduct
        throw error
      }
    }
  }
  