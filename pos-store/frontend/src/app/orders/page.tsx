'use client'

import { OrderList } from '@/components/orders/OrderList'
import { OrderFilters } from '@/components/orders/OrderFilters'
import { useState } from 'react'

interface Filters {
  search: string
  status: string
  startDate: string
  endDate: string
}

export default function OrdersPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    startDate: '',
    endDate: ''
  })

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
      <OrderFilters filters={filters} onFilterChange={setFilters} />
      <OrderList filters={filters} />
    </div>
  )
}
