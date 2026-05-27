"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Users, Table } from "lucide-react";
import { cn } from "@/lib";
import type { EventModel } from "@/types";
import { EventCard } from "@/components/event/event-card";

const CARD_WIDTH = 280;
const GAP = 24;

function ts(d: Date | string | null | undefined): number {
  if (!d) return 0;
  if (d instanceof Date) return d.getTime();
  return new Date(d).getTime();
}

type RadioView = "grid" | "organizer";

function groupByOrganizer(events: EventModel[]): Map<string, EventModel[]> {
  const map = new Map<string, EventModel[]>();
  for (const e of events) {
    const name = e.organizerName || "Other";
    if (!map.has(name)) map.set(name, []);
    map.get(name)!.push(e);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => ts(a.startDate) - ts(b.startDate));
  }
  return map;
}

function indexOfNearest(events: EventModel[]): number {
  const now = Date.now();
  let best = 0;
  let bestDiff = Math.abs(ts(events[0].startDate) - now);
  for (let i = 1; i < events.length; i++) {
    const d = Math.abs(ts(events[i].startDate) - now);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  }
  return best;
}

interface Props {
  upcomingEvents: EventModel[];
  pastEvents: EventModel[];
  spotMap: Record<number, string>;
}

export function EventsGridContent({
  upcomingEvents,
  pastEvents,
  spotMap,
}: Props) {
  const [view, setView] = useState<RadioView>("grid");
  const router = useRouter();
  const organizerRowsRef = useRef<Map<string, HTMLDivElement | null>>(
    new Map(),
  );

  const organizerEntries = Array.from(
    groupByOrganizer([...upcomingEvents, ...pastEvents]).entries(),
  );

  useEffect(() => {
    if (view !== "organizer") return;
    const run = () => {
      organizerEntries.forEach(([name, events]) => {
        if (!events.length) return;
        const el = organizerRowsRef.current.get(name);
        if (!el) return;
        el.scrollLeft = indexOfNearest(events) * (CARD_WIDTH + GAP);
      });
    };
    run();
    const t = requestAnimationFrame(run);
    return () => cancelAnimationFrame(t);
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Events</h1>
          <p className="text-xs text-muted-foreground">
            Meetups, conferences, and more
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/events/table")}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
        >
          <Table className="h-3.5 w-3.5" />
          Table
        </button>
      </header>

      {/* Radio toggle */}
      <div className="flex rounded-lg border border-border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setView("grid")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            view === "grid"
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setView("organizer")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            view === "organizer"
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Organizer
        </button>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming
            </h2>
            <div className="overflow-x-auto px-1">
              <div className="flex gap-6 min-w-max">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} spotMap={spotMap} />
                ))}
              </div>
            </div>
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No upcoming events.
              </p>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Past
            </h2>
            <div className="overflow-x-auto px-1">
              <div className="flex gap-6 min-w-max">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} spotMap={spotMap} />
                ))}
              </div>
            </div>
            {pastEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">No past events.</p>
            )}
          </section>
        </div>
      )}

      {/* Organizer view */}
      {view === "organizer" && (
        <div className="flex flex-col gap-8">
          {organizerEntries.map(([organizerName, events]) => (
            <section key={organizerName}>
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                {organizerName}
              </h2>
              <div
                ref={(el) => {
                  organizerRowsRef.current.set(organizerName, el);
                }}
                className="overflow-x-auto overflow-y-hidden px-1 scroll-smooth"
                style={{ scrollbarGutter: "stable" }}
              >
                <div className="flex gap-6 min-w-max pb-2 mr-[800px]">
                  {events.map((event, i) => (
                    <div
                      key={event.id}
                      data-nearest={
                        i === indexOfNearest(events) ? "true" : undefined
                      }
                    >
                      <EventCard event={event} spotMap={spotMap} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
          {organizerEntries.length === 0 && (
            <p className="text-sm text-muted-foreground">No events.</p>
          )}
        </div>
      )}
    </div>
  );
}
