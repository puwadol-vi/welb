import type { Event } from "@/types";
import { MapPin, Users } from "lucide-react";

interface EventHighlightsSliderProps {
  events: Event[];
}

export function EventHighlightsSlider({ events }: EventHighlightsSliderProps) {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {events.map((event) => {
        const date = new Date(event.startDate);
        const month = date.toLocaleString("en", { month: "short" });
        const day = date.getDate();
        return (
          <div
            key={event.id}
            className="flex min-w-[280px] flex-col gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/15 text-primary">
                <span className="text-[10px] font-semibold uppercase leading-none">
                  {month}
                </span>
                <span className="text-lg font-bold leading-none">{day}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground leading-tight">
                  {event.title}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.city}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.participantCount}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {"by "}
              <span className="font-semibold text-foreground">
                {event.organizerName}
              </span>
            </p>
            {event.isPaid ? (
              <span className="self-start rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                {event.price.toLocaleString()} {event.currency}
              </span>
            ) : (
              <span className="self-start rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                Free
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
