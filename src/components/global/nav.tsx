"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Home, MapPin, ShoppingBag, Calendar, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/spots", label: "Spots", icon: MapPin },
  { href: "/shops", label: "Shop", icon: ShoppingBag },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/digital", label: "Digital", icon: Layers },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <>
      {/* Top nav for sm and above */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 hidden border-b border-border bg-card/95 backdrop-blur-md sm:block"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="px-4 flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="WelB"
              width={120}
              height={40}
              className="h-10 w-auto rounded-full"
              priority
            />
            <span className="font-bold text-2xl text-primary">WelB</span>
          </Link>
          <div className="flex items-center gap-1">
            {tabs.slice(1).map((tab) => {
              const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
              const Icon = tab.icon
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Bottom nav for mobile */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md sm:hidden"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
