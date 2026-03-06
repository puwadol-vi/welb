"use client"

import { useState, useMemo } from "react"
import { onlineProducts } from "@/lib/mock-data"
import { ShoppingBag, MessageSquare, Search } from "lucide-react"
import { cn } from "@/lib/utils"

const categoryFilters = ["All", "Accessories", "Apparel", "Stickers", "Security"] as const

export default function ShopsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = useMemo(() => {
    return onlineProducts.filter((p) => {
      const matchCategory = activeCategory === "All" || p.category === activeCategory
      const matchSearch = searchQuery === "" || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [activeCategory, searchQuery])

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      {/* Header */}
      <header>
        <h1 className="text-xl font-bold text-foreground">Shop</h1>
        <p className="text-xs text-muted-foreground">Buy Bitcoin merchandise online</p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products or sellers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {/* Category filters */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</p>
        <div className="flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Filter by category">
          {categoryFilters.map((filter) => (
            <button
              key={filter}
              role="radio"
              aria-checked={activeCategory === filter}
              onClick={() => setActiveCategory(filter)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                activeCategory === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Products count */}
      <p className="text-xs text-muted-foreground">
        {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
      </p>

      {/* Products grid */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        {filteredProducts.length === 0 && (
          <div className="col-span-2 rounded-xl border border-border bg-card p-8 text-center">
            <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No products found.</p>
          </div>
        )}
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3"
          >
            <div className="flex aspect-square items-center justify-center rounded-lg bg-secondary">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <h3 className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{product.title}</h3>
              <span className="text-[10px] font-medium text-muted-foreground">{product.category}</span>

              <div className="mt-auto flex items-baseline gap-1">
                <span className="text-sm font-bold text-primary">{product.price.toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground">{product.currency}</span>
              </div>
            </div>

            <div className="border-t border-border pt-2">
              <p className="text-[10px] text-muted-foreground">
                {"Sold by "}
                <span className="font-semibold text-foreground">{product.sellerName}</span>
              </p>
            </div>

            <a
              href={product.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Contact Shop
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
