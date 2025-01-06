'use client'

import { usePaymentMethods, useProcessPayment } from '@/hooks/use-payments'
import { useCreateOrder } from '@/hooks/use-orders'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from 'sonner'
import { Product } from '@/types/api'
import useSound from 'use-sound'
import { ReceiptPrinter, ReceiptPrinterRef } from './ReceiptPrinter'
import { useRef, useState } from 'react'
import { paymentService } from '@/services/payment.service'

interface PaymentPanelProps {
  cart: Product[]
  onPaymentComplete: () => void
}

export function PaymentPanel({ cart, onPaymentComplete }: PaymentPanelProps) {
  const { data } = usePaymentMethods()
  const { mutate: createOrder } = useCreateOrder()
  const { mutate: processPayment } = useProcessPayment()
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const printerRef = useRef<ReceiptPrinterRef>(null)

  const total = cart.reduce((sum, item) => sum + item.price * item.stock_quantity, 0)
  const [playSuccess] = useSound('/sounds/beep-success.mp3')
  const [playError] = useSound('/sounds/beep-error.mp3')

  const handlePayment = async (method: string) => {
    const { data } = await paymentService.getPaymentMethods()
    const paymentMethod = Array.isArray(data) ? data.find(m => m.id === method) : null

    if (paymentMethod?.min_amount && total < paymentMethod.min_amount) {
      toast.error(`Số tiền tối thiểu là ${paymentMethod.min_amount.toLocaleString()}đ`)
      return
    }

    createOrder(
      {
        items: cart.map(item => ({
          product_id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.stock_quantity
        })),
        payment_method: method
      },
      {
        onSuccess: (response) => {
          console.log('Order Response:', response)
          const orderNumber = response.data.order_number
          console.log('Order Number:', orderNumber)
          setCurrentOrder(response.data as any)
          setShowPrintDialog(true)
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
        },        onError: () => {
          toast.error('Tạo đơn hàng thất bại')
          playError()
        }
      }
    )
  }
  
  const handlePrintConfirm = async (shouldPrint: boolean) => {
    if (shouldPrint && printerRef.current) {
      await printerRef.current.printReceipt(currentOrder)
    }
    setShowPrintDialog(false)
    onPaymentComplete()
  }

  return (
    <>
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

      <ReceiptPrinter ref={printerRef} orderData={currentOrder} />

      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>In hóa đơn</DialogTitle>
            <DialogDescription>
              Bạn có muốn in hóa đơn cho đơn hàng này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handlePrintConfirm(false)}>
              Không in
            </Button>
            <Button onClick={() => handlePrintConfirm(true)}>
              In hóa đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}