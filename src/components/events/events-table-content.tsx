"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Table } from "lucide-react";
import { cn } from "@/lib";
import type { EventModel } from "@/types";

function ts(d: Date | string | null | undefined): number {
  if (!d) return 0;
  if (d instanceof Date) return d.getTime();
  return new Date(d).getTime();
}

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtDateTime(d: Date | string | null | undefined): string {
  if (!d) return "-";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString("th-TH", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Preset = "lastCreated" | "pastNearest" | "futureNearest";

const PRESETS: { id: Preset; label: string }[] = [
  { id: "lastCreated", label: "Last Created" },
  { id: "pastNearest", label: "Past & Nearest" },
  { id: "futureNearest", label: "Future & Nearest" },
];

interface Props {
  events: EventModel[];
  spotMap: Record<number, string>;
}

export function EventsTableContent({ events, spotMap }: Props) {
  const [preset, setPreset] = useState<Preset | null>(null);
  const [organizer, setOrganizer] = useState<string>("all");
  const router = useRouter();

  const now = Date.now();

  // Unique organizer names in the order they first appear
  const organizers = Array.from(
    new Set(events.map((e) => e.organizerName || "Other")),
  );

  // Step 1: sort/filter by preset
  let rows: EventModel[];
  if (preset === "lastCreated") {
    rows = [...events].sort((a, b) => ts(b.createdAt) - ts(a.createdAt));
  } else if (preset === "pastNearest") {
    rows = events
      .filter((e) => ts(e.startDate) < now)
      .sort((a, b) => ts(b.startDate) - ts(a.startDate));
  } else if (preset === "futureNearest") {
    rows = events
      .filter((e) => ts(e.startDate) >= now)
      .sort((a, b) => ts(a.startDate) - ts(b.startDate));
  } else {
    rows = [...events].sort((a, b) => ts(b.startDate) - ts(a.startDate));
  }

  // Step 2: filter by organizer
  if (organizer !== "all") {
    rows = rows.filter((e) => (e.organizerName || "Other") === organizer);
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        {/* Left: title + organizer pills — takes remaining width, pills scroll horizontally */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="shrink-0">
            <h1 className="text-xl font-bold text-foreground">Events</h1>
            <p className="text-xs text-muted-foreground">
              Meetups, conferences, and more
            </p>
          </div>
          <div className="w-px h-6 bg-border mx-1 shrink-0" />
          <div className="flex min-w-0 flex-1 overflow-x-auto gap-2 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setOrganizer("all")}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                organizer === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              All
            </button>
            {organizers.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() =>
                  setOrganizer((prev) => (prev === name ? "all" : name))
                }
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  organizer === name
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: presets + Table — fixed, never shrinks */}
        <div className="flex shrink-0 items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset((prev) => (prev === p.id ? null : p.id))}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                preset === p.id
                  ? "border-emerald-600 bg-emerald-600/15 text-emerald-400"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
          >
            <Table className="h-3.5 w-3.5" />
            Table
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">id</th>
              <th className="px-4 py-3">title</th>
              <th className="px-4 py-3">organizer_name</th>
              <th className="px-4 py-3">type</th>
              <th className="px-4 py-3">start_date</th>
              <th className="px-4 py-3">end_date</th>
              <th className="px-4 py-3">location</th>
              <th className="px-4 py-3">spot_id</th>
              <th className="px-4 py-3">price</th>
              <th className="px-4 py-3">currency</th>
              <th className="px-4 py-3">participant_count</th>
              <th className="px-4 py-3">description</th>
              <th className="px-4 py-3">image_url</th>
              <th className="px-4 py-3">event_url</th>
              <th className="px-4 py-3">registration_url</th>
              <th className="px-4 py-3">is_welb_project</th>
              <th className="px-4 py-3">is_market</th>
              <th className="px-4 py-3">is_suggested</th>
              <th className="px-4 py-3">is_verified</th>
              <th className="px-4 py-3">is_active</th>
              <th className="px-4 py-3">created_at</th>
              <th className="px-4 py-3">updated_at</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((event) => {
              const isLive = event.isActive && event.isVerified;
              const isPending = event.isActive && !event.isVerified;
              return (
                <tr
                  key={event.id}
                  className={cn(
                    "border-b border-border transition-colors",
                    isLive
                      ? "bg-emerald-950 hover:bg-emerald-900/60"
                      : isPending
                        ? "bg-yellow-900 hover:bg-yellow-900/60"
                        : "bg-background hover:bg-muted/30",
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {event.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {event.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {event.organizerName}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {event.type}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {fmtDateTime(event.startDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {fmtDateTime(event.endDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {event.location || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {event.spotId != null
                      ? `${event.spotId}${spotMap[event.spotId] ? ` (${spotMap[event.spotId]})` : ""}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {event.price ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {event.currency ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {event.participantCount ?? "—"}
                  </td>
                  <td className="px-4 py-3 max-w-[240px] truncate text-muted-foreground">
                    {event.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {event.imageUrl ? (
                      <a
                        href={event.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        img <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {event.eventUrl ? (
                      <a
                        href={event.eventUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        link <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {event.registrationUrl ? (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        reg <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {event.isWelBProject ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {event.isMarket ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {event.isSuggested ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {event.isVerified ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {event.isActive ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {fmtDate(event.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {fmtDate(event.updatedAt)}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={22}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
