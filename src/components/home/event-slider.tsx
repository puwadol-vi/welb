import type { EventModel } from "@/types";
import { getEventSpots } from "@/actions/spot";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EventCard } from "../event/event-card";

interface EventSliderProps {
  events: EventModel[];
  href: string;
}

export async function EventSlider({ events, href }: EventSliderProps) {
  const spots = await getEventSpots();
  const spotMap: Record<number, string> = Object.fromEntries(
    spots.map((s) => [s.id, s.name]),
  ) as Record<number, string>;

  return (
    <div className="mx-auto">
      <div className="overflow-x-auto px-1">
        <div className="flex gap-6 min-w-max">
          {events.map((event) => (
            <EventCard key={event.id} event={event} spotMap={spotMap} />
          ))}
          <Link
            href={href}
            className="flex w-[280px] shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-8 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            See more events
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
