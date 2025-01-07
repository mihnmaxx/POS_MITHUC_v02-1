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

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const handleProductSelect = (product: Product) => {
    const existingItemIndex = cartItems.findIndex(item => item._id === product._id)
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...cartItems]
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        stock_quantity: (updatedItems[existingItemIndex].stock_quantity || 1) + 1
      }
      setCartItems(updatedItems)
    } else {
      setCartItems(prev => [...prev, { ...product, stock_quantity: 1 }])
    }
    
    playAdd()
    toast.success(`Đã thêm ${product.name}`)
  }

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const product = await productCache.getProduct(barcode)
      if (product) {
        handleProductSelect(product)
        playBarcode()
      } else {
        playError()
        toast.error('Không tìm thấy sản phẩm')
      }
    } catch (error) {
      playError()
      toast.error('Lỗi khi quét mã')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleQuickSearch = () => {
    playClick()
  }

  const handleBulkScan = () => {
    playClick()
  }

  const handleClearCart = () => {
    if (cartItems.length > 0) {
      const confirm = window.confirm('Xóa giỏ hàng?')
      if (confirm) {
        setCartItems([])
        playClick()
      }
    }
  }

  const handlePaymentComplete = async () => {
    try {
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
              <BarcodeScanner 
                onScan={handleBarcodeScan}
                onAddToCart={handleProductSelect}
              />
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
            <PaymentPanel 
              cart={cartItems} 
              onPaymentComplete={handlePaymentComplete} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
