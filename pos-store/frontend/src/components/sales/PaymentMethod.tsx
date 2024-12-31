'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

export function PaymentMethod() {
  const [method, setMethod] = useState('cash')
  
  const handlePayment = async () => {
    try {
      // Gọi API để xử lý thanh toán
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: method,
          // Thêm thông tin giỏ hàng
        })
      })
      
      if (response.ok) {
        // In hóa đơn và reset giỏ hàng
      }
    } catch (err) {
      console.error('Payment error:', err)
    }
  }

  return (
    <Card className="p-4">
      <RadioGroup value={method} onValueChange={setMethod}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cash" id="cash" />
          <Label htmlFor="cash">Tiền mặt</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="qr" id="qr" />
          <Label htmlFor="qr">Quét mã QR</Label>
        </div>
      </RadioGroup>
      
      <div className="mt-4">
        <Button onClick={handlePayment} className="w-full">
          Thanh toán
        </Button>
      </div>
    </Card>
  )
}
