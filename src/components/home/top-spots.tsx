import type { SpotModel } from "@/types";
import { ExternalLink } from "lucide-react";

interface TopBitcoinSpotsProps {
  spots: SpotModel[];
}

export function TopBitcoinSpots({ spots }: TopBitcoinSpotsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {spots.map((shop) => {
        return (
          <div
            key={shop.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-lg bg-primary/10">
                📍
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {shop.name}
                </h3>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {shop.category} &middot; {shop.province}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {shop.description}
            </p>
            <a
              href={shop.googleMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Open in Maps
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        );
      })}
    </div>
  );
}
