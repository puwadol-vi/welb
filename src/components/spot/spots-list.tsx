"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Table, ExternalLink } from "lucide-react";
import { cn } from "@/lib";
import type { SpotModel } from "@/types";
import { categories } from "@/const/categories";
import { regions } from "@/const/regions";

const ShopsMap = dynamic(
  () => import("@/components/spot/shops-map").then((m) => m.ShopsMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[640px] w-full rounded-xl border border-border animate-pulse bg-muted" />
    ),
  },
);

type ViewType = "map" | "table";

interface SpotsListProps {
  initialSpots: SpotModel[];
  initialView?: ViewType;
}

export function SpotsList({ initialSpots, initialView = "map" }: SpotsListProps) {
  const [view, setView] = useState<ViewType>(initialView);
  const router = useRouter();
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeRegion, setActiveRegion] = useState<string>("all");

  const filteredSpots = useMemo(() => {
    return initialSpots.filter((s) => {
      const mainCat = s.category.split("-")[0];
      const matchCategory =
        activeCategory === "all" || mainCat === activeCategory;
      const matchRegion = activeRegion === "all" || s.region === activeRegion;
      return matchCategory && matchRegion;
    });
  }, [initialSpots, activeCategory, activeRegion]);

  return (
    <>
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Spots</h1>
          <p className="text-xs text-muted-foreground">
            Thailand Bitcoin Physical Spaces
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (pathname === "/spots/table") {
              router.push("/spots");
            } else {
              router.push("/spots/table");
            }
          }}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            view === "table"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
          aria-label="Toggle table view"
        >
          <Table className="h-3.5 w-3.5" />
          Table
        </button>
      </header>

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

      {/* Map view */}
      {view === "map" && <ShopsMap spots={filteredSpots} />}

      {/* Table view */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Province</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Links</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpots.map((spot, i) => (
                <tr
                  key={spot.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/30",
                    i % 2 === 0 ? "bg-background" : "bg-muted/10",
                  )}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {spot.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {spot.category}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {spot.region}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {spot.provinceTh ?? spot.province}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                    {spot.address ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {spot.googleMapLink && (
                        <a
                          href={spot.googleMapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Map
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {spot.websiteLink && (
                        <a
                          href={spot.websiteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Web
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {spot.facebookLink && (
                        <a
                          href={spot.facebookLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          FB
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSpots.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No spots found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
