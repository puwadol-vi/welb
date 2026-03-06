import { AdminSpotsList } from "@/components/admin/spots-list";

export const dynamic = "force-dynamic";

export default async function AdminSpotsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Admin: Spots Management
          </h1>
        </header>
        <AdminSpotsList />
      </div>
    </div>
  );
}
