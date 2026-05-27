import { getEventsForPage } from "@/actions/event";
import { getEventSpots } from "@/actions/spot";
import { EventsGridContent } from "@/components/events/events-grid-content";

export default async function EventsPage() {
  const [eventData, spots] = await Promise.all([
    getEventsForPage(),
    getEventSpots(),
  ]);
  const spotMap: Record<number, string> = Object.fromEntries(
    spots.map((s) => [s.id, s.name]),
  ) as Record<number, string>;

  return (
    <EventsGridContent
      upcomingEvents={eventData.upcomingEvents}
      pastEvents={eventData.pastEvents}
      spotMap={spotMap}
    />
  );
}
