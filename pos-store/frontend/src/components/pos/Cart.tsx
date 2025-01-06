'use client'

import { 
  Package, 
  Hash, 
  DollarSign, 
  Calculator,
  Trash2
} from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types/api'

interface CartProps {
  items: Product[]
  setItems: (items: Product[]) => void
  handleQuantityChange: (id: string, value: string) => void
  handleRemoveItem: (id: string) => void
}

export function Cart({ items, setItems }: CartProps) {
  // Đổi tên function để tránh trùng lặp
  const updateQuantity = (id: string, value: string) => {
    const quantity = parseInt(value)
    if (isNaN(quantity) || quantity < 1) return

    setItems(items.map(item => 
      item._id === id ? { ...item, quantity } : item
    ))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item._id !== id))
  }

  return (
    <div className="p-4 bg-card rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="text-muted-foreground border-b border-border">
            <th className="pb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Package className="w-5 h-5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sản phẩm</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </th>
            <th className="pb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Hash className="w-5 h-5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Số lượng</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </th>
            <th className="pb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Calculator className="w-5 h-5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Thành tiền</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </th>
            <th className="pb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Trash2 className="w-5 h-5" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xoá</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item._id} className="border-b border-border">
              <td className="py-2 text-foreground">{item.name}</td>
              <td className="py-2">
                <Input
                  type="number"
                  value={item.stock_quantity ?? 1}
                  onChange={(e) => updateQuantity(item._id, e.target.value)}
                  min={1}
                  className="w-20"
                />
              </td>
              <td className="py-2 text-right text-foreground">
                {formatCurrency(item.price * (item.stock_quantity ?? 1))}
              </td>
              <td className="py-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeItem(item._id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
