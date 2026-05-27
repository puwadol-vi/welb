"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { LayoutGrid, Users, Table, ExternalLink } from "lucide-react";
import { cn } from "@/lib";
import type { EventModel } from "@/types";
import { EventCard } from "@/components/event/event-card";

const CARD_WIDTH = 280;
const GAP = 24;

type RadioView = "grid" | "organizer";
type ViewType = RadioView | "table";

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

function formatDate(date: Date): string {
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function EventsPageContent({
  upcomingEvents,
  pastEvents,
  spotMap,
}: EventsPageContentProps) {
  const [view, setView] = useState<ViewType>("grid");
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

  const allEvents = useMemo(
    () =>
      [...upcomingEvents, ...pastEvents].sort(
        (a, b) => b.startDate.getTime() - a.startDate.getTime(),
      ),
    [upcomingEvents, pastEvents],
  );

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-6">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Events</h1>
          <p className="text-xs text-muted-foreground">
            Meetups, conferences, and more
          </p>
        </div>
        <button
          type="button"
          onClick={() => setView(view === "table" ? "grid" : "table")}
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

      {/* Radio toggle (hidden in table view) */}
      {view !== "table" && (
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
      )}

      {view === "grid" && (
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

      {view === "table" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Organizer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {allEvents.map((event, i) => (
                <tr
                  key={event.id}
                  className={`border-b border-border transition-colors hover:bg-muted/30 ${
                    i % 2 === 0 ? "bg-background" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-foreground max-w-[200px]">
                    {event.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {event.organizerName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {event.type}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(event.startDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">
                    {spotMap[event.spotId ?? -1] ?? event.location}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {event.price != null
                      ? `${event.price} ${event.currency ?? ""}`.trim()
                      : "Free"}
                  </td>
                  <td className="px-4 py-3">
                    {event.eventUrl && (
                      <a
                        href={event.eventUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Event
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {allEvents.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
