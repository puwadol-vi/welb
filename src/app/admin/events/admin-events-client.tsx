"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { getAppUser } from "@/actions/user";
import { AdminEventsList } from "@/components/admin/events-list";

export function AdminEventsPageClient() {
  const { user, loading: authLoading } = useAuth();
  const [organizerAccess, setOrganizerAccess] = useState<string  | "loading">("loading");

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
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Please sign in to access admin.</p>
        <Link href="/" className="text-primary font-medium hover:underline">
          Go to home
        </Link>
      </div>
    );
  }

  if (organizerAccess === "") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">You don’t have access to this page.</p>
        <Link href="/" className="text-primary font-medium hover:underline">
          Go to home
        </Link>
      </div>
    );
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
