import { notFound } from "next/navigation";
import { AdminEventsList } from "@/components/admin/events-list";
import { shouldShowAdminNotFound } from "@/lib";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  if (shouldShowAdminNotFound()) {
    return notFound();
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Admin: Events Management
          </h1>
        </header>
        <AdminEventsList />
      </div>
    </div>
  );
}
