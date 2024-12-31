'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface User {
  name: string
  email: string
  avatar: string
}

interface NavUserProps {
  user: User
}

export function NavUser({ user }: NavUserProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center w-full p-4 group-data-[collapsible=icon]:p-0">
        <div className="flex items-center justify-center w-full">
            <Avatar className="h-9 w-9 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-3 text-left group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
        <DropdownMenuItem>Cài đặt</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ThemeToggle />
          <span className="ml-2">Giao diện</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
