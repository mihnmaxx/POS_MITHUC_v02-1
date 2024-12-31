'use client'

import { useState } from 'react'
import { Table } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Product {
  id: string
  barcode: string
  name: string
  price: number
  quantity: number
}

export function ProductList() {
  const [items, setItems] = useState<Product[]>([])
  
  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="mt-4">
      <Table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, +e.target.value)}
                  min={1}
                  className="w-20"
                />
              </td>
              <td>{item.price.toLocaleString()}đ</td>
              <td>{(item.price * item.quantity).toLocaleString()}đ</td>
              <td>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="mt-4 text-right text-xl font-bold">
        Tổng cộng: {total.toLocaleString()}đ
      </div>
    </div>
  )
}
