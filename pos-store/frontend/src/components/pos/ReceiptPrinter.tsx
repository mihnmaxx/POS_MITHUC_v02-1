'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Printer } from 'lucide-react'

interface ReceiptPrinterProps {
  orderData?: any
}

export interface ReceiptPrinterRef {
  printReceipt: (orderData: any) => void
}

export const ReceiptPrinter = forwardRef<ReceiptPrinterRef, ReceiptPrinterProps>((props, ref) => {

  const printReceipt = (orderData: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <html>
        <head>
          <title>Hóa đơn - ${orderData.order_number}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: Arial;
              width: 80mm;
              padding: 5mm;
              margin: 0;
              font-size: 12px;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
            .item { margin: 5px 0; }
            .total { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h1>MITHUC MINIMART</h1>
            <div class="divider"></div>
          </div>
          
          <div>
            <p>Số HĐ: ${orderData.order_number}</p>
            <p>Ngày: ${new Date().toLocaleString('vi-VN')}</p>
          </div>

          <div class="divider"></div>

          ${orderData.items?.map((item: any) => `
            <div>
              <p>${item.name}</p>
              <p>${item.quantity} x ${item.price.toLocaleString()}đ = 
                 ${(item.quantity * item.price).toLocaleString()}đ</p>
            </div>
          `).join('')}

          <div class="divider"></div>

          <div class="text-right">
            <p>Tổng tiền: ${orderData.total?.toLocaleString()}đ</p>
          </div>

          <div class="text-center">
            <p>Cảm ơn quý khách!</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  useImperativeHandle(ref, () => ({
    printReceipt: (orderData: any) => {
      try {
        printReceipt(orderData)
        toast.success('In hóa đơn thành công')
      } catch (error) {
        toast.error('Lỗi khi in hóa đơn')
      }
    }
  }))

  return (
    <div className="w-full bg-card border border-border rounded-lg p-4">
      <Badge variant="secondary">
        <Printer className="w-4 h-4 mr-1" />
        Máy in sẵn sàng
      </Badge>
    </div>
  )
})

ReceiptPrinter.displayName = 'ReceiptPrinter'
