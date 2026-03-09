import { AdminEventsPageClient } from "./admin-events-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default function AdminEventsPage() {
  return <AdminEventsPageClient />;
}
