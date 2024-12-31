'use client'

import { usePaymentMethods, useProcessPayment } from '@/hooks/use-payments'
import { useCreateOrder } from '@/hooks/use-orders'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Product } from '@/types/api'
import { useEffect } from 'react'
import useSound from 'use-sound'

interface PaymentPanelProps {
  cart: Product[]
  onPaymentComplete: () => void
}

export function PaymentPanel({ cart, onPaymentComplete }: PaymentPanelProps) {
  const { data } = usePaymentMethods()
  const { mutate: createOrder } = useCreateOrder()
  const { mutate: processPayment } = useProcessPayment()

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const [playSuccess] = useSound('/sounds/beep-success.mp3')
  const [playError] = useSound('/sounds/beep-error.mp3')

  const handlePayment = (method: string) => {
    const selectedMethod = data?.methods?.find(m => m.id === method)
    if (selectedMethod?.min_amount && total < selectedMethod.min_amount) {
      toast.error(`Số tiền tối thiểu là ${selectedMethod.min_amount.toLocaleString()}đ`)
      return
    }

    createOrder(
      {
        items: cart.map(item => ({
          product_id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        payment_method: method
      },
      {
        onSuccess: (response) => {
          console.log('Order Response:', response)
          const orderNumber = response.data.order_number
          console.log('Order Number:', orderNumber)
          processPayment(
            {
              orderNumber: orderNumber,
              data: {
                amount: total,
                method: method
              }
            },
            {
              onSuccess: () => {
                toast.success('Thanh toán thành công')
                playSuccess()
                onPaymentComplete()
              },
              onError: () => {
                toast.error('Thanh toán thất bại')
                playError()
              }
            }
          )
        },
        onError: () => {
          toast.error('Tạo đơn hàng thất bại')
          playError()
        }
      }
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="text-2xl font-bold mb-4">
        Tổng tiền: {total.toLocaleString()}đ
      </div>
      <div className="space-y-4">
        <Button 
          onClick={() => handlePayment('cash')}
          className="w-full p-4 bg-green-500 hover:bg-green-600 text-white"
        >
          Thanh toán tiền mặt
        </Button>
        <Button 
          onClick={() => handlePayment('transfer')}
          className="w-full p-4 bg-blue-500 hover:bg-blue-600 text-white"
        >
          Thanh toán chuyển khoản
        </Button>
      </div>
    </div>
  )
}
