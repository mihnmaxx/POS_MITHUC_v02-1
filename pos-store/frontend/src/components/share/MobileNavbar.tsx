'use client'

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, ShoppingCart, Package, Users, Receipt, Settings2, BarChart, Store, Tags, Clock } from "lucide-react"
import { NavMain } from "@/components/share/nav-main"
import { NavUser } from "@/components/share/nav-user"
import { StoreSwitcher } from "@/components/share/store-switcher"

const posData = {
    user: {
        name: "Thu ngân",
        email: "cashier@store.com",
        avatar: "/avatars/5049207_avatar_people_person_profile_user_icon.svg",
    },
    stores: [
        {
        name: "Mithuc Minimart",
        logo: Store,
        plan: "Enterprise",
        },
        {
        name: "Chi nhánh 1",
        logo: Store,
        plan: "Business",
        }
    ],
    navMain: [
        {
        title: "Bán hàng",
        url: "/pos",
        icon: ShoppingCart,
        isActive: true,
        items: [
            {
            title: "POS",
            url: "/pos",
            },
            {
            title: "Đơn hàng",
            url: "/orders",
            },
            {
            title: "Trả hàng",
            url: "/returns",
            },
        ],
        },
        {
        title: "Quản lý",
        url: "/management",
        icon: Package,
        items: [
            {
            title: "Sản phẩm",
            url: "/products",
            },
            {
            title: "Danh mục",
            url: "/categories",
            },
            {
            title: "Kho hàng",
            url: "/inventory",
            },
            {
            title: "Khuyến mãi",
            url: "/promotions", 
            },
        ],
        },
        {
        title: "Báo cáo",
        url: "/reports",
        icon: BarChart,
        items: [
            {
            title: "Doanh thu",
            url: "/reports/sales",
            },
            {
            title: "Lợi nhuận",
            url: "/reports/profit",
            },
            {
            title: "Tồn kho",
            url: "/reports/inventory",
            },
        ],
        },
        {
        title: "Cài đặt",
        url: "/settings",
        icon: Settings2,
        items: [
            {
            title: "Cửa hàng",
            url: "/settings/store",
            },
            {
            title: "Người dùng",
            url: "/settings/users",
            },
            {
            title: "Thanh toán",
            url: "/settings/payment",
            },
        ],
        },
    ],
}

export function MobileNavbar() {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetTitle>Menu</SheetTitle>
          <div className="flex flex-col h-full">
            <StoreSwitcher stores={posData.stores} />
            <NavMain items={posData.navMain} />
            <div className="mt-auto">
              <NavUser user={posData.user} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }