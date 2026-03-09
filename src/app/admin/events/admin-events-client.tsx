"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { getAppUser } from "@/actions/user";
import { AdminEventsList } from "@/components/admin/events-list";
import { notFound } from "next/navigation";

export function AdminEventsPageClient() {
  const { user, loading: authLoading } = useAuth();
  const [organizerAccess, setOrganizerAccess] = useState<string | "loading">(
    "loading",
  );

  useEffect(() => {
    if (!user) {
      setOrganizerAccess("");
      return;
    }
    getAppUser(user.uid).then((appUser) => {
      if (!appUser) {
        setOrganizerAccess("");
        return;
      }
      setOrganizerAccess(appUser.organizer);
    });
  }, [user]);

  if (authLoading || organizerAccess === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return notFound();
  }

  if (organizerAccess === "") {
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
        <AdminEventsList organizerAccess={organizerAccess} />
      </div>
    </div>
  );
}
