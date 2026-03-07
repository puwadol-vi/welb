import { getEventsForPage } from "@/actions/event";
import { getEventSpots } from "@/actions/spot";
import { EventsPageContent } from "@/components/events/events-page-content";

export default async function EventsPage() {
  const [eventData, spots] = await Promise.all([
    getEventsForPage(),
    getEventSpots(),
  ]);
  const spotMap: Record<number, string> = Object.fromEntries(
    spots.map((s) => [s.id, s.name]),
  ) as Record<number, string>;

  return (
    <EventsPageContent
      upcomingEvents={eventData.upcomingEvents}
      pastEvents={eventData.pastEvents}
      spotMap={spotMap}
    />
  );
}
