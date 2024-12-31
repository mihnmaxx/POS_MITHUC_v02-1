'use client'

import { useState } from 'react'
import { BarcodeScanner } from '@/components/sales/BarcodeScanner'
import { PaymentMethod } from '@/components/sales/PaymentMethod'
import { ProductList } from '@/components/sales/ProductList'

interface Product {
  id: string
  barcode: string
  name: string
  price: number
  quantity: number
}

interface BarcodeScannerProps {
  onScan: (barcode: string) => Promise<void>
}

interface ProductListProps {
  items: Product[]
  setItems: React.Dispatch<React.SetStateAction<Product[]>>
}

interface PaymentMethodProps {
  onPayment: (method: string) => Promise<void>
  total: number
}

export default function SalesPage() {
  const [cart, setCart] = useState<Product[]>([])

  const handleBarcodeScanned = async (barcode: string) => {
    // Fetch product data from API
    const product = await fetch(`/api/products/${barcode}`).then(res => res.json())
    
    setCart(prev => {
      const existing = prev.find(item => item.barcode === barcode)
      if (existing) {
        return prev.map(item => 
          item.barcode === barcode 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const handlePayment = async (method: string) => {
    const sale = {
      items: cart,
      payment_method: method,
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }
    
    // Process payment and print receipt
    await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale)
    })

    // Reset cart after successful payment
    setCart([])
  }

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      <div className="col-span-8">
        <BarcodeScanner />
        <ProductList />
      </div>
      <div className="col-span-4">
        <PaymentMethod />
      </div>
    </div>
  ) 
}
