import { AdminSpotsPageClient } from "./admin-spots-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default function AdminSpotsPage() {
  return <AdminSpotsPageClient />;
}
