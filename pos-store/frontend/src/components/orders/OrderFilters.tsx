'use client'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'

export function OrderFilters({ filters, onFilterChange }: { filters: { search: string; status: string }; onFilterChange: (filters: { search: string; status: string }) => void }) {
  return (
    <div className="flex gap-4 items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm đơn hàng..."
          value={filters.search}
          onChange={(e) => onFilterChange({...filters, search: e.target.value})}
          className="pl-9"
        />
      </div>
      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange({...filters, status: value})}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="pending">Chờ xử lý</option>
        <option value="completed">Hoàn thành</option>
        <option value="cancelled">Đã hủy</option>
      </Select>
      <Button variant="outline">
        <Filter className="w-4 h-4 mr-2" />
        Lọc thêm
      </Button>
    </div>
  )
}
