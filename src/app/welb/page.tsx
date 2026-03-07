import { getWelbEvents } from "@/actions/event";
import { getEventSpots } from "@/actions/spot";
import { EventCard } from "@/components/event/event-card";

export const revalidate = 3600;

export default async function WelbPage() {
  const [{ upcomingEvents, pastEvents }, spots] = await Promise.all([
    getWelbEvents(),
    getEventSpots(),
  ]);
  const spotMap: Record<number, string> = Object.fromEntries(
    spots.map((s) => [s.id, s.name]),
  ) as Record<number, string>;
  const hasAny = upcomingEvents.length > 0 || pastEvents.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_50%_0%,rgba(247,147,26,0.06)_0%,transparent_50%)]" />

      <section className="px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-[1140px]">
          <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
            WelB Activities
          </h1>
          <p className="mb-8 text-muted-foreground">
            กิจกรรมและผลงานที่ WelB ได้มีส่วนร่วม
          </p>
          <>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              กำลังจะมาถึง
            </h2>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
              <div className="flex gap-6 min-w-max">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} spotMap={spotMap} />
                ))}
              </div>
            </div>
          </>
          <>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              ที่ผ่านมา
            </h2>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-6 min-w-max">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} spotMap={spotMap} />
                ))}
              </div>
            </div>
          </>
          {!hasAny && (
            <div className="py-16 text-center text-muted-foreground">
              ยังไม่มีกิจกรรม
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
