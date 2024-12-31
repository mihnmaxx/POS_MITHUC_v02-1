'use client'

import { useState, useEffect } from 'react'
import { BarcodeScanner } from '@/components/pos/BarcodeScanner'
import { Cart } from '@/components/pos/Cart'
import { PaymentPanel } from '@/components/pos/PaymentPanel'
import { QuickActions } from '@/components/pos/QuickActions'
import { ProductSelector } from '@/components/pos/ProductSelector'
import { ProductCache } from '@/services/productCache'
import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'sonner'
import { useSoundEffect } from '@/hooks/use-sound-effect'
import { Product } from '@/types/api'

export default function POSPage() {
  const [cartItems, setCartItems] = useState<Product[]>([])
  const { playClick, playSuccess, playError, playAdd, playRemove, playBarcode } = useSoundEffect()
  const productCache = new ProductCache()

  useHotkeys('ctrl+p', () => handlePrint())
  useHotkeys('ctrl+k', () => handleQuickSearch())
  useHotkeys('ctrl+b', () => handleBulkScan())
  useHotkeys('esc', () => handleClearCart())

  // Load saved cart on mount
  useEffect(() => {
    playAdd()
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart when it changes
  useEffect(() => {
    playAdd()
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const handleProductSelect = (product: Product) => {
    try {
      const existingItemIndex = cartItems.findIndex(item => item._id === product._id)
      
      if (existingItemIndex !== -1) {
        // Update existing product quantity
        const updatedItems = [...cartItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: (updatedItems[existingItemIndex].quantity || 1) + 1
        }
        setCartItems(updatedItems)
      } else {
        // Add new product to cart
        setCartItems([...cartItems, { ...product, quantity: 1 }])
      }
      
      toast.success(`Đã thêm ${product.name}`)
      playAdd()
    } catch (error) {
      toast.error('Không thể thêm sản phẩm')
      playError()
    }
  }

  const handleBarcodeScan = async (barcode: string) => {
    playBarcode()
    try {
      const product = await productCache.getProduct(barcode)
      if (product) {
        handleProductSelect(product)
      } else {
        toast.error('Không tìm thấy sản phẩm')
      }
    } catch (error) {
      toast.error('Lỗi khi quét mã')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleQuickSearch = () => {
    playClick()
    // Implement quick search dialog
  }

  const handleBulkScan = () => {
    playClick()
    // Implement bulk scanning mode
  }

  const handleClearCart = () => {
    playClick()
    if (cartItems.length > 0) {
      const confirm = window.confirm('Xóa giỏ hàng?')
      if (confirm) setCartItems([])
        playClick()
    }
  }

  const handlePaymentComplete = async () => {
    try {
      // Process payment
      // Print receipt
      setCartItems([])
      localStorage.removeItem('cart')
      playSuccess()
      toast.success('Thanh toán thành công')
    } catch (error) {
      playError()
      toast.error('Lỗi thanh toán')
    }
  }

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    playClick()
    const updatedItems = cartItems.map(item =>
      item._id === productId ? { ...item, quantity: parseInt(newQuantity, 10) } : item
    )
    setCartItems(updatedItems)
  }

  const handleRemoveItem = (productId: string) => {
    playRemove()
    const updatedItems = cartItems.filter(item => item._id !== productId)
    setCartItems(updatedItems)
  }

  return (
    <div className="h-screen bg-background">
      <div className="grid grid-cols-12 gap-6 h-full w-full p-6">
        <div className="col-span-8 xl:col-span-9 2xl:col-span-10">
          <div className="space-y-6">
            <div className="gap-4">
              <BarcodeScanner onScan={handleBarcodeScan} />
            </div>
            
            <div className="bg-card rounded-lg">
              <ProductSelector onProductSelect={handleProductSelect} />
            </div>
          </div>
        </div>
  
        <div className="col-span-4 xl:col-span-3 2xl:col-span-2 flex flex-col h-full">
          <div className="flex-1 overflow-auto bg-card border border-border rounded-lg mb-6">
            <Cart
              items={cartItems}
              setItems={setCartItems}
              handleQuantityChange={handleQuantityChange}
              handleRemoveItem={handleRemoveItem}
            />
          </div>
          
          <div className="space-y-6">
            <QuickActions />
            <PaymentPanel cart={cartItems as any} onPaymentComplete={handlePaymentComplete} />
          </div>
        </div>
      </div>
    </div>
  )
}