"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib";
import type { SpotModel } from "@/types";

const ShopsMap = dynamic(
  () => import("@/components/spot/shops-map").then((m) => m.ShopsMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[640px] w-full rounded-xl border border-border animate-pulse bg-muted" />
    ),
  },
);
import { categories } from "@/const/categories";
import { regions } from "@/const/regions";

interface SpotsListProps {
  initialSpots: SpotModel[];
}

export function SpotsList({ initialSpots }: SpotsListProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeRegion, setActiveRegion] = useState<string>("all");

  const filteredSpots = useMemo(() => {
    return initialSpots.filter((s) => {
      // category is stored as "food-cafe", extract main category before the dash
      const mainCat = s.category.split("-")[0];
      const matchCategory =
        activeCategory === "all" || mainCat === activeCategory;
      const matchRegion = activeRegion === "all" || s.region === activeRegion;
      return matchCategory && matchRegion;
    });
  }, [initialSpots, activeCategory, activeRegion]);

  return (
    <>
      {/* Category filters */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Category
        </p>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="radiogroup"
          aria-label="Filter by category"
        >
          <button
            role="radio"
            aria-checked={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              role="radio"
              aria-checked={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Region filters */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Region
        </p>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="radiogroup"
          aria-label="Filter by region"
        >
          <button
            role="radio"
            aria-checked={activeRegion === "all"}
            onClick={() => setActiveRegion("all")}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              activeRegion === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            All
          </button>
          {regions.map((region) => (
            <button
              key={region}
              role="radio"
              aria-checked={activeRegion === region}
              onClick={() => setActiveRegion(region)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                activeRegion === region
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <ShopsMap spots={filteredSpots} />
    </>
  );
}
