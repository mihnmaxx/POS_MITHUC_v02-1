'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface NavItem {
  title: string
  url: string
  icon: any
  isActive?: boolean
  items?: { title: string; url: string }[]
}

interface NavMainProps {
  items: NavItem[]
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <Collapsible key={item.url}>
          <CollapsibleTrigger asChild>
            <Button
              variant={pathname.startsWith(item.url) ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          </CollapsibleTrigger>
          {item.items && (
            <CollapsibleContent className="pl-6 pt-1">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.url}
                  href={subItem.url}
                  className={`block py-1 text-sm ${
                    pathname === subItem.url ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {subItem.title}
                </Link>
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
      ))}
    </nav>
  )
}
