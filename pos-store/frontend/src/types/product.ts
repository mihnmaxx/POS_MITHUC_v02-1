export interface Product {
    id: string
    barcode: string
    name: string
    price: number
    quantity: number
    category: string
    image?: string
    sku?: string
    cost?: number
    stock?: number
    created_at?: Date
    updated_at?: Date
  }
