'use client'

import { useEffect, useRef, useState } from 'react'
import { useSound } from 'use-sound'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { ProductCache } from '@/services/productCache'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onAddToCart: (product: any) => void
}

export function BarcodeScanner({ onScan, onAddToCart }: BarcodeScannerProps) {
  const [playSuccess] = useSound('/sounds/beep-success.mp3')
  const [playError] = useSound('/sounds/beep-error.mp3')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const productCache = new ProductCache()
  const [currentBarcode, setCurrentBarcode] = useState<string>('')

  const findProduct = async (barcode: string) => {
    try {
      const product = await productCache.getProduct(barcode)
      console.log('Response from API:', product)
      
      // Kiểm tra product có tồn tại và có _id
      if (product && product._id) {
        return product  // Trả về trực tiếp product object
      }
      return null
    } catch (error) {
      console.error('Lỗi tìm sản phẩm:', error)
      return null
    }
  }

  useEffect(() => {
    let lastKeyTime = Date.now()
    const BARCODE_DELAY = 50

    const handleKeyPress = async (e: KeyboardEvent) => {
      const currentTime = Date.now()
      
      if (currentTime - lastKeyTime > BARCODE_DELAY) {
        setCurrentBarcode('')
      }

      if (e.key === 'Enter' && currentBarcode) {
        const product = await findProduct(currentBarcode)
        if (product) {
          playSuccess()
          onAddToCart(product)
          toast.success(`Đã thêm ${product.name} vào giỏ`)
          setCurrentBarcode('')
          if (searchInputRef.current) {
            searchInputRef.current.value = ''
            searchInputRef.current.focus()
          }
        } else {
          playError()
          toast.error('Không tìm thấy sản phẩm')
        }
      } else if (/^[0-9A-Z]$/.test(e.key.toUpperCase())) {
        setCurrentBarcode(prev => prev + e.key.toUpperCase())
      }

      lastKeyTime = currentTime
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleScan = async (value: string) => {
    if (!value) return
  
    try {
      const product = await findProduct(value)
      console.log('Product found:', product) // Thêm log để kiểm tra
  
      // Kiểm tra product có đầy đủ thông tin
      if (product && product._id && product.name) {
        playSuccess()
        onAddToCart(product) // Gọi callback để thêm vào giỏ hàng
        toast.success(`Đã thêm ${product.name} vào giỏ`)
        
        if (searchInputRef.current) {
          searchInputRef.current.value = ''
          searchInputRef.current.focus()
        }
      } else {
        playError()
        toast.error('Không tìm thấy sản phẩm')
      }
    } catch (error) {
      playError()
      toast.error('Lỗi khi tìm sản phẩm')
    }
  }

  const validateBarcode = (code: string) => {
    const validFormats = {
      'EAN13': /^[0-9]{13}$/,
      'UPCA': /^[0-9]{12}$/,
      'CODE128': /^[A-Z0-9]{6,20}$/
    }
    return Object.values(validFormats).some(regex => regex.test(code))
  }

  return (
    <div className="w-full bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Quét mã sản phẩm</h2>
        </div>

        <Input
          ref={searchInputRef}
          type="text"
          className="w-full"
          placeholder="Quét mã sản phẩm..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = e.currentTarget.value.trim()
              if (validateBarcode(value)) {
                handleScan(value)
              } else {
                playError()
                toast.error('Mã vạch không hợp lệ')
                e.currentTarget.value = ''
              }
            }
          }}
          autoFocus
        />

        <div className="text-sm text-muted-foreground text-center">
          Đặt con trỏ vào ô tìm kiếm và quét mã vạch
        </div>
      </div>
    </div>
  )
}
