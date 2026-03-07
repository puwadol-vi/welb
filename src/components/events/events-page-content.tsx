"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, LayoutGrid, Users } from "lucide-react";
import type { EventModel } from "@/types";
import { EventCard } from "@/components/event/event-card";

const CARD_WIDTH = 280;
const GAP = 24;

type ViewType = "" | "organizer";

interface EventsPageContentProps {
  upcomingEvents: EventModel[];
  pastEvents: EventModel[];
  spotMap: Record<number, string>;
}

/** Group events by organizer, each group sorted by startDate ascending (oldest → newest). */
function groupByOrganizer(
  upcoming: EventModel[],
  past: EventModel[],
): Map<string, EventModel[]> {
  const all = [...upcoming, ...past];
  const byName = new Map<string, EventModel[]>();
  for (const e of all) {
    const name = e.organizerName || "Other";
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name)!.push(e);
  }
  for (const arr of byName.values()) {
    arr.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }
  return byName;
}

/** Index of event whose startDate is closest to now. */
function indexOfNearest(events: EventModel[]): number {
  const now = Date.now();
  let best = 0;
  let bestDiff = Math.abs(events[0].startDate.getTime() - now);
  for (let i = 1; i < events.length; i++) {
    const d = Math.abs(events[i].startDate.getTime() - now);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  }
  return best;
}

export function EventsPageContent({
  upcomingEvents,
  pastEvents,
  spotMap,
}: EventsPageContentProps) {
  const [view, setView] = useState<ViewType>("");
  const organizerRowsRef = useRef<Map<string, HTMLDivElement | null>>(
    new Map(),
  );

  // Scroll each organizer row so the "nearest" event is in view (left side)
  useEffect(() => {
    if (view !== "organizer") return;
    const byOrg = groupByOrganizer(upcomingEvents, pastEvents);
    const run = () => {
      byOrg.forEach((events, name) => {
        if (events.length === 0) return;
        const el = organizerRowsRef.current.get(name) ?? null;
        if (!el) return;
        const idx = indexOfNearest(events);
        el.scrollLeft = idx * (CARD_WIDTH + GAP);
      });
    };
    run();
    const t = requestAnimationFrame(run);
    return () => cancelAnimationFrame(t);
  }, [view, upcomingEvents, pastEvents]);

  const organizerEntries = useMemo(
    () => Array.from(groupByOrganizer(upcomingEvents, pastEvents).entries()),
    [upcomingEvents, pastEvents],
  );

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-6">
      <header>
        <h1 className="text-xl font-bold text-foreground">Events</h1>
        <p className="text-xs text-muted-foreground">
          Meetups, conferences, and more
        </p>
      </header>

      {/* Toggle */}
      <div className="flex rounded-lg border border-border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setView("")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            view === ""
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

      {view === "" && (
        <div className="flex flex-col gap-10">
          {/* Upcoming — slide view (nearest first) */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming
            </h2>
            <div className="mx-auto">
              <div className="overflow-x-auto px-1">
                <div className="flex gap-6 min-w-max">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} spotMap={spotMap} />
                  ))}
                </div>
              </div>
            </div>
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No upcoming events.
              </p>
            )}
          </section>

          {/* Past — slide view, latest first */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Past
            </h2>
            <div className="mx-auto">
              <div className="overflow-x-auto px-1">
                <div className="flex gap-6 min-w-max">
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} spotMap={spotMap} />
                  ))}
                </div>
              </div>
            </div>
            {pastEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">No past events.</p>
            )}
          </section>
        </div>
      )}

      {view === "organizer" && (
        <div className="flex flex-col gap-8">
          {organizerEntries.map(([organizerName, events]) => {
            const nearestIdx = indexOfNearest(events);
            return (
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
                        data-nearest={i === nearestIdx ? "true" : undefined}
                      >
                        <EventCard event={event} spotMap={spotMap} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
          {organizerEntries.length === 0 && (
            <p className="text-sm text-muted-foreground">No events.</p>
          )}
        </div>
      )}
    </div>
  );
}
