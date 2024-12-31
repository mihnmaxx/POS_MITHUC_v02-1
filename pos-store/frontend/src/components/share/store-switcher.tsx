'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Store {
  name: string
  logo: any
  plan: string
}

interface StoreSwitcherProps {
  stores: Store[]
}

export function StoreSwitcher({ stores }: StoreSwitcherProps) {
  return (
    <Select defaultValue={stores[0].name}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Chọn cửa hàng" />
      </SelectTrigger>
      <SelectContent>
        {stores.map((store) => (
          <SelectItem key={store.name} value={store.name}>
            <div className="flex items-center">
              <store.logo className="mr-2 h-4 w-4" />
              <span>{store.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {store.plan}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
