'use client'

import { useParams } from 'next/navigation'
import { useOrder } from '@/hooks/use-orders'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { OrderDetailSkeleton } from '@/components/orders/OrderDetailSkeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  subtotal: number
}

interface Order {
  order_number: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  status: 'completed' | 'pending' | 'cancelled'
  payment_status: 'paid' | 'pending' | 'refunded'
  created_at: string
}

export default function OrderDetailPage() {
  const params = useParams()
  console.log('Params:', params)
  const { data, isLoading } = useOrder(params.order_number as string) as { data: Order | undefined, isLoading: boolean }
  console.log('Data:', data)
  const order = data // Thêm .data vì response API được wrap trong data

  console.log('Order Data:', order)

  if (isLoading) return <OrderDetailSkeleton />
  if (!order) return <div>Không tìm thấy đơn hàng</div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Đơn hàng #{order?.order_number}</h1>
        </div>
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          In đơn hàng
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold mb-4">Chi tiết đơn hàng</h2>
            <table className="w-full">
              <thead>
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left pb-2">Sản phẩm</th>
                  <th className="text-right pb-2">Đơn giá</th>
                  <th className="text-right pb-2">Số lượng</th>
                  <th className="text-right pb-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order?.items.map((item) => (
                  <tr key={item.product_id}>
                    <td className="py-2">{item.name}</td>
                    <td className="text-right py-2">{formatCurrency(item.price)}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t">
                <tr>
                  <td colSpan={3} className="text-right pt-2">Tổng tiền hàng:</td>
                  <td className="text-right pt-2">{formatCurrency(order?.subtotal || 0)}</td>
                </tr>
                <tr>
                  {/* phần thuế được chỉnh tại pos-store/backend/app/services/order_service.py */}
                  <td colSpan={3} className="text-right pt-2">VAT:</td>
                  <td className="text-right pt-2">{formatCurrency(order?.tax || 0)}</td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={3} className="text-right pt-2">Tổng cộng:</td>
                  <td className="text-right pt-2">{formatCurrency(order?.total || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold mb-4">Thông tin đơn hàng</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Trạng thái:</dt>
                <dd>
                  <Badge variant={
                    order?.status === 'completed' ? 'default' :
                    order?.status === 'pending' ? 'secondary' : 
                    'destructive'
                  }>
                    {order?.status === 'completed' ? 'Hoàn thành' :
                     order?.status === 'pending' ? 'Chờ xử lý' :
                     'Đã hủy'}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Thanh toán:</dt>
                <dd>
                  <Badge variant={
                    order?.payment_status === 'paid' ? 'default' :
                    order?.payment_status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {order?.payment_status === 'paid' ? 'Đã thanh toán' :
                     order?.payment_status === 'pending' ? 'Chưa thanh toán' :
                     'Hoàn tiền'}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ngày tạo:</dt>
                <dd>{formatDateTime(order?.created_at || '')}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}