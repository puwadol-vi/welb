"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Calendar, MapPin } from "lucide-react";
import { CreateEventDialog } from "@/components/global/create-event-dialog";
import { CreateSpotDialog } from "@/components/global/create-spot-dialog";
import type { CreateEvent } from "@/types/event";
import { CreateSpot, SubmitResult } from "@/types";

type FloatingCreateButtonProps = {
  onSubmitEvent: (data: CreateEvent) => Promise<SubmitResult>;
  onSubmitSpot: (data: CreateSpot) => Promise<SubmitResult>;
};

export function FloatingCreateButton({
  onSubmitEvent,
  onSubmitSpot,
}: FloatingCreateButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [spotDialogOpen, setSpotDialogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [dropdownOpen]);

  const openEventDialog = () => {
    setDropdownOpen(false);
    setEventDialogOpen(true);
  };

  const openSpotDialog = () => {
    setDropdownOpen(false);
    setSpotDialogOpen(true);
  };

  return (
    <>
      <div
        className="fixed bottom-20 right-6 z-50 sm:bottom-8 sm:right-8"
        ref={dropdownRef}
      >
        {/* Dropdown: above the button */}
        {dropdownOpen && (
          <div className="absolute bottom-full right-0 mb-2 min-w-[240px] rounded-lg border border-border bg-card py-1 shadow-lg">
            <button
              type="button"
              onClick={openEventDialog}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted"
            >
              <Calendar className="h-4 w-4 text-primary" />
              Add new event
            </button>
            <button
              type="button"
              onClick={openSpotDialog}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted"
            >
              <MapPin className="h-4 w-4 text-primary" />
              Add new bitcoin shop
            </button>
          </div>
        )}

        {/* FAB */}
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-black shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Create event or spot"
          aria-expanded={dropdownOpen}
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </button>
      </div>

      <CreateEventDialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        onSuccess={() => setEventDialogOpen(false)}
        onSubmit={onSubmitEvent}
      />
      <CreateSpotDialog
        open={spotDialogOpen}
        onClose={() => setSpotDialogOpen(false)}
        onSuccess={() => setSpotDialogOpen(false)}
        onSubmit={onSubmitSpot}
      />
    </>
  );
}
