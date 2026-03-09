"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { getAppUser } from "@/actions/user";
import { AdminSpotsList } from "@/components/admin/spots-list";
import { notFound } from "next/navigation";

export function AdminSpotsPageClient() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<string | "loading">("loading");

  useEffect(() => {
    if (!user) {
      setRole("");
      return;
    }
    getAppUser(user.uid).then((appUser) => {
      setRole(appUser?.role ?? "");
    });
  }, [user]);

  if (authLoading || role === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return notFound();
  }

  if (role !== "admin") {
    return notFound();
  }

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
