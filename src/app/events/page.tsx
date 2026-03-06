"use client";

import { events } from "@/lib/mock-data";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Zap,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function EventsPage() {
  const now = new Date();
  const thisWeekEnd = new Date();
  thisWeekEnd.setDate(now.getDate() + (7 - now.getDay()));

  const weekendEvents = events.filter((e) => {
    const d = new Date(e.startDate);
    return d >= now && d <= thisWeekEnd;
  });
  const featuredEvent = weekendEvents[0] || events[0];
  const otherEvents = events.filter((e) => e.id !== featuredEvent.id);
  const marketEvents = events.filter((e) => e.isMarketActive);

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      {/* Header */}
      <header>
        <h1 className="text-xl font-bold text-foreground">Events</h1>
        <p className="text-xs text-muted-foreground">
          Meetups, conferences, and more
        </p>
      </header>

      {/* This Weekend Banner */}
      {featuredEvent && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
          <span className="mb-2 inline-block rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            This Weekend
          </span>
          <h2 className="text-lg font-bold text-foreground">
            {featuredEvent.title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {featuredEvent.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(featuredEvent.startDate).toLocaleDateString("en", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {featuredEvent.city}
            </span>
            <span className="flex items-center gap-1 text-primary font-semibold">
              <Users className="h-3 w-3" />
              {featuredEvent.participantCount} attending
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {"by "}
            <span className="font-semibold text-foreground">
              {featuredEvent.organizerName}
            </span>
            {" \u00b7 "}
            {featuredEvent.location}
          </p>
          {featuredEvent.isMonthly && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-primary font-semibold">
              <RefreshCw className="h-3 w-3" />
              Monthly Series
            </div>
          )}
          <a
            href={featuredEvent.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {featuredEvent.isPaid ? (
              <>
                <Ticket className="h-4 w-4" />
                {"Buy Ticket - "}
                {featuredEvent.price.toLocaleString()} {featuredEvent.currency}
              </>
            ) : (
              <>Register Free</>
            )}
          </a>
        </div>
      )}

      {/* All Events */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Upcoming Events
        </h2>
        <div className="flex flex-col gap-3">
          {otherEvents.map((event) => {
            const date = new Date(event.startDate);
            return (
              <div
                key={event.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <span className="text-[10px] font-semibold uppercase leading-none">
                      {date.toLocaleString("en", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      {event.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.city}
                  </span>
                  <span className="text-muted-foreground/60">
                    {event.location}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {"by "}
                  <span className="font-semibold text-foreground">
                    {event.organizerName}
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                    <Users className="h-3 w-3" />
                    {event.participantCount} attending
                  </span>
                  {event.isMonthly && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                      <RefreshCw className="h-3 w-3" />
                      Monthly
                    </span>
                  )}
                  {event.isPaid ? (
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                      {event.price.toLocaleString()} {event.currency}
                    </span>
                  ) : (
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                      Free
                    </span>
                  )}
                </div>

                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {event.isPaid ? (
                    <>
                      <Ticket className="h-3.5 w-3.5" />
                      Buy Ticket
                    </>
                  ) : (
                    "Register"
                  )}
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lightning Market */}
      {marketEvents.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            Lightning Market
          </h2>
          <div className="flex flex-col gap-3">
            {marketEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-primary/20 bg-primary/5 p-4"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {event.title}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {event.marketInfo}
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(event.startDate).toLocaleDateString("en", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {" \u00b7 "}
                  <MapPin className="h-3 w-3" />
                  {event.city}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
