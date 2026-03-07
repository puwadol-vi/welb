import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronRight } from "lucide-react";
import { EventModel } from "@/types";

export function EventCard({
  event,
  spotMap,
}: {
  event: EventModel;
  spotMap: Record<number, string>;
}) {
  const href = event.eventUrl || event.registrationUrl || null;
  const start =
    event.startDate instanceof Date
      ? event.startDate
      : new Date(event.startDate);
  const dateTimeLabel = `${start.toLocaleDateString("th-TH", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} · ${start.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`;
  return (
    <Link
      href={href ?? "#"}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden w-[280px] shrink-0 hover:border-primary/40 transition-colors"
    >
      <div className="relative aspect-4/3 bg-muted overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 280px, 50vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-4xl">
            📍
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          {dateTimeLabel}
        </p>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="shrink-0 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              {event.type}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {(event.spotId != null ? spotMap[event.spotId] : null) ??
                event.location ??
                ""}
            </span>
          </div>
          {event.price != null && (
            <span className="shrink-0 text-xs font-medium text-foreground">
              {event.currency === "THB" || event.currency === "฿"
                ? "฿"
                : (event.currency ?? "")}
              {event.price.toLocaleString()}
            </span>
          )}
        </div>
        <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
          {event.description || ""}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {href && (
            <span className="inline-flex items-center gap-0.5 font-medium text-primary">
              ดูเพิ่มเติม
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
