import { getEvents } from "@/actions/event";
import { getEventSpots } from "@/actions/spot";
import { EventsTableContent } from "@/components/events/events-table-content";

export default async function EventsTablePage() {
  const [events, spots] = await Promise.all([
    getEvents(),
    getEventSpots(),
  ]);
  const spotMap: Record<number, string> = Object.fromEntries(
    spots.map((s) => [s.id, s.name]),
  ) as Record<number, string>;

  return (
    <EventsTableContent
      events={events}
      spotMap={spotMap}
    />
  );
}
