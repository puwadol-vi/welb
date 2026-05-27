import { getActiveSpots } from "@/actions/spot";
import { SpotsList } from "@/components/spot/spots-list";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

export default async function SpotsPage() {
  const spots = await getActiveSpots();

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <SpotsList initialSpots={spots} />
    </div>
  );
}
