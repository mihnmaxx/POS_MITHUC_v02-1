'use client'

import { useOrders } from '@/hooks/use-orders'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDateTime, formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from 'next/navigation'

interface OrderListProps {
    filters: {
      status?: string
      startDate?: string
      endDate?: string
      search?: string
    }
  }

export function OrderList({ filters }: OrderListProps) {
  const router = useRouter()
  const { data, isLoading } = useOrders(filters)
  const orders = data?.orders // Truy cập đúng cấu trúc response API

  if (isLoading) {
    return <OrderListSkeleton />
  }

  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[180px]">Mã đơn hàng</TableHead>
                <TableHead className="w-[180px]">Ngày tạo</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="w-[140px]">Trạng thái</TableHead>
                <TableHead className="w-[140px]">Thanh toán</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {orders?.map((order) => (
                <TableRow 
                key={order._id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/orders/number/${order.order_number}`)}
                >
                <TableCell>{order.order_number}</TableCell>
                <TableCell>{formatDateTime(order.created_at)}</TableCell>
                <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                <TableCell>
                    <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                    <PaymentStatusBadge status={order.payment_status} />
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    </div>
  )
}function OrderStatusBadge({ status }: { status: 'completed' | 'pending' | 'cancelled' }) {
  const variants: { [key: string]: string } = {
    completed: "success",
    pending: "warning",
    cancelled: "destructive"
  }

  const labels: { [key: string]: string } = {
    completed: "Hoàn thành",
    pending: "Chờ xử lý",
    cancelled: "Đã hủy"
  }

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  )
}

function PaymentStatusBadge({ status }: { status: 'paid' | 'pending' | 'refunded' }) {
  const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    paid: "default",
    pending: "secondary",
    refunded: "destructive"
  }

  const labels: { [key: string]: string } = {
    paid: "Đã thanh toán",
    pending: "Chờ thanh toán",
    refunded: "Hoàn tiền"
  }

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  )
}function OrderListSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn hàng</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thanh toán</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
