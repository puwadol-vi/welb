import { getActiveSpots } from "@/actions/spot";
import { SpotsList } from "@/components/spot/spots-list";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

export default async function SpotsPage() {
  const spots = await getActiveSpots();

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      {/* Header */}
      <header>
        <h1 className="text-xl font-bold text-foreground">Spots</h1>
        <p className="text-xs text-muted-foreground">
          Thailand Bitcoin Physical Spaces
        </p>
      </header>

      {/* Client component for interactive filters and list */}
      <SpotsList initialSpots={spots} />
    </div>
  );
}
