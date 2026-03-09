"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { getEvents, updateEvent, createEvent } from "@/actions/event";
import { getEventSpots } from "@/actions/spot";
import {
  CreateEventDialog,
} from "@/components/global/create-event-dialog";
import { DateTimePicker } from "@/components/global/date-time-picker";
import { organizers_list } from "@/const/event";
import { SpotModel, EventModel, EVENT_TYPES } from "@/types";
import { Check, X, Search, Pencil, Plus, ExternalLink } from "lucide-react";

function eventDate(ev: EventModel): Date {
  const raw = ev.endDate ?? ev.startDate;
  return typeof raw === "string" ? new Date(raw) : raw;
}

export function AdminEventsList({
  organizerAccess = "",
}: {
  organizerAccess: string;
}) {
  const [events, setEvents] = useState<EventModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [welbOnly, setWelbOnly] = useState(organizerAccess === "admin");
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "past">("upcoming");
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<EventModel>>({});
  const [spots, setSpots] = useState<SpotModel[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    getEventSpots().then(setSpots);
  }, []);

  const now = new Date();
  const orgList = organizerAccess === "admin" ? organizers_list :[organizerAccess]

  const filteredEvents = events
    .filter((ev) => {
      const matchesOrganizer = organizerAccess === "admin" ? true : ev.organizerName === organizerAccess;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        (ev.location ?? "").toLowerCase().includes(q) ||
        (ev.organizerName ?? "").toLowerCase().includes(q);
      const matchesWelb = !welbOnly || ev.isWelBProject;
      const date = eventDate(ev);
      const isUpcoming = date >= now;
      const matchesTime = timeFilter === "upcoming" ? isUpcoming : !isUpcoming;
      return matchesSearch && matchesWelb && matchesTime && matchesOrganizer;
    })
    .sort((a, b) => {
      const da = eventDate(a).getTime();
      const db = eventDate(b).getTime();
      if (timeFilter === "upcoming") return da - db; // nearest on top
      return db - da; // past: latest on top
    });

  const handleEdit = (event: EventModel) => {
    setEditingId(event.id);
    setEditData({ ...event });
  };

  const handleSave = async (id: string) => {
    startTransition(async () => {
      const result = await updateEvent(id, editData);
      if (result.success) {
        setEditingId(null);
        setEditData({});
        await fetchEvents();
      } else {
        alert(`Error: ${result.error}`);
      }
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleToggleWelB = async (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await updateEvent(id, { isWelBProject: !current });
      if (result.success) await fetchEvents();
    });
  };

  const handleToggleMarket = async (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await updateEvent(id, { isMarket: !current });
      if (result.success) await fetchEvents();
    });
  };
  const handleToggleSuggested = async (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await updateEvent(id, { isMarket: !current });
      if (result.success) await fetchEvents();
    });
  };
  const handleToggleVerified = async (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await updateEvent(id, { isMarket: !current });
      if (result.success) await fetchEvents();
    });
  };
  const handleToggleActive = async (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await updateEvent(id, { isMarket: !current });
      if (result.success) await fetchEvents();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, location, organizer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-0.5">
          <button
            type="button"
            onClick={() => setWelbOnly(true)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${welbOnly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Welb
          </button>
          <button
            type="button"
            onClick={() => setWelbOnly(false)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${!welbOnly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            All
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-0.5">
          <button
            type="button"
            onClick={() => setTimeFilter("upcoming")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${timeFilter === "upcoming" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter("past")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${timeFilter === "past" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Past
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create
        </button>
      </div>

      <div className="text-sm text-muted-foreground">
        {loading
          ? "Loading..."
          : `Showing ${filteredEvents.length} of ${events.length} events`}
        {isPending && " (saving...)"}
      </div>

      <div className="relative overflow-x-auto rounded-lg border border-border">
        <table className="w-max min-w-full text-sm">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Title</th>
              <th className="px-3 py-2 text-left font-medium">Description</th>
              <th className="px-3 py-2 text-left font-medium">Price</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Start</th>
              <th className="px-3 py-2 text-left font-medium">End</th>
              <th className="px-3 py-2 text-left font-medium">Location</th>
              <th className="px-3 py-2 text-left font-medium">Spot</th>
              <th className="px-3 py-2 text-left font-medium">Organizer</th>
              <th className="px-3 py-2 text-left font-medium">Link</th>
              <th className="px-3 py-2 text-left font-medium">Regis</th>
              <th className="px-3 py-2 text-left font-medium">Image</th>
              <th className="px-3 py-2 text-center font-medium">WelB</th>
              <th className="px-3 py-2 text-center font-medium">Market</th>
              <th className="px-3 py-2 text-center font-medium">Suggested</th>
              <th className="px-3 py-2 text-center font-medium">Verified</th>
              <th className="px-3 py-2 text-center font-medium">Active</th>
              <th className="sticky right-0 z-20 bg-muted/50 px-3 py-2 text-left font-medium border-l border-border"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredEvents.map((ev) => {
              const isEditing = editingId === ev.id;
              return (
                <tr key={ev.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 min-w-[180px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.title ?? ""}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="font-medium">{ev.title}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-[360px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.description ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="font-medium">{ev.description}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <div className="flex flex-row gap-1">
                        <input
                          type="number"
                          value={editData.price ?? ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              price: Number(e.target.value),
                            })
                          }
                          className="w-16 rounded border border-border bg-background px-2 py-1 text-sm"
                        />
                        <input
                          type="text"
                          value={editData.currency ?? ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              currency: e.target.value,
                            })
                          }
                          className="w-16 rounded border border-border bg-background px-2 py-1 text-sm"
                        />
                      </div>
                    ) : (
                      <span className="font-medium">{`${ev.price ?? ""} ${ev.currency ?? ""}`}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editData.type ?? "meetup"}
                        onChange={(e) =>
                          setEditData({ ...editData, type: e.target.value })
                        }
                        className="rounded border border-border bg-background px-2 py-1 text-xs"
                      >
                        {EVENT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs">{ev.type}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <DateTimePicker
                        value={
                          editData.startDate
                            ? editData.startDate instanceof Date
                              ? editData.startDate
                              : new Date(editData.startDate)
                            : null
                        }
                        onChange={(d) =>
                          setEditData({
                            ...editData,
                            startDate: d ?? undefined,
                          })
                        }
                        placeholder="Start"
                        inputClassName="text-xs"
                      />
                    ) : (
                      <span className="text-xs">
                        {ev.startDate
                          ? new Date(ev.startDate).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <DateTimePicker
                        value={
                          editData.endDate
                            ? editData.endDate instanceof Date
                              ? editData.endDate
                              : new Date(editData.endDate)
                            : null
                        }
                        onChange={(d) =>
                          setEditData({ ...editData, endDate: d ?? undefined })
                        }
                        placeholder="End"
                        inputClassName="text-xs"
                      />
                    ) : (
                      <span className="text-xs">
                        {ev.endDate
                          ? new Date(ev.endDate).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-[200px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.location ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            location: e.target.value || "",
                          })
                        }
                        className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className="text-xs line-clamp-2">
                        {ev.location || "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-[200px]">
                    {isEditing ? (
                      <select
                        value={editData.spotId ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            spotId:
                              e.target.value === ""
                                ? null
                                : parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full min-w-[120px] rounded border border-border bg-background px-2 py-1 text-xs"
                      >
                        <option value="">—</option>
                        {spots.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs line-clamp-2">
                        {ev.spotId != null
                          ? (spots.find((s) => s.id === ev.spotId)?.name ??
                            String(ev.spotId))
                          : "-"}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editData.organizerName ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            organizerName: e.target.value || "",
                          })
                        }
                        className="w-28 rounded border border-border bg-background px-2 py-1 text-xs"
                      >
                        {orgList.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs">{ev.organizerName || "-"}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.eventUrl ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            eventUrl: e.target.value,
                          })
                        }
                        placeholder="Paste Event link"
                        className="w-40 rounded border border-border bg-background px-2 py-1 text-xs"
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        {ev.eventUrl && (
                          <a
                            href={ev.eventUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="Open saved link"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.registrationUrl ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            registrationUrl: e.target.value,
                          })
                        }
                        placeholder="Paste Registration link"
                        className="w-40 rounded border border-border bg-background px-2 py-1 text-xs"
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        {ev.registrationUrl && (
                          <a
                            href={ev.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="Open saved link"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.imageUrl ?? ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            imageUrl: e.target.value,
                          })
                        }
                        placeholder="Paste Image link"
                        className="w-40 rounded border border-border bg-background px-2 py-1 text-xs"
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        {ev.imageUrl && (
                          <a
                            href={ev.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="Open saved link"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleWelB(ev.id, ev.isWelBProject)}
                      disabled={isPending}
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        ev.isWelBProject
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ev.isWelBProject ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleMarket(ev.id, ev.isMarket)}
                      disabled={isPending}
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        ev.isMarket
                          ? "bg-green-500/20 text-green-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ev.isMarket ? "Yes" : "No"}
                    </button>
                  </td>
                  {/* Suggested (toggle) */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleToggleSuggested(ev.id, ev.isSuggested)
                      }
                      disabled={isPending}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        ev.isSuggested
                          ? "bg-purple-500/20 text-purple-600 hover:bg-purple-500/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {ev.isSuggested ? "Yes" : "No"}
                    </button>
                  </td>

                  {/* Verified (toggle) */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleToggleVerified(ev.id, ev.isVerified)}
                      disabled={isPending}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        ev.isVerified
                          ? "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                          : "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30"
                      }`}
                    >
                      {ev.isVerified ? "Verified" : "Unverified"}
                    </button>
                  </td>

                  {/* Active (toggle) */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(ev.id, ev.isActive)}
                      disabled={isPending}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        ev.isActive
                          ? "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                          : "bg-red-500/20 text-red-600 hover:bg-red-500/30"
                      }`}
                    >
                      {ev.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Actions (sticky right) */}
                  <td className="sticky right-0 z-10 bg-background border-l border-border px-3 py-2">
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(ev.id)}
                            disabled={isPending}
                            className="rounded bg-green-600 p-1 text-white hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="rounded bg-gray-600 p-1 text-white hover:bg-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(ev)}
                          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredEvents.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          No events found
        </div>
      )}

      <CreateEventDialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => fetchEvents()}
        onSubmit={createEvent}
        organizer={
          organizerAccess
        }
      />
    </div>
  );
}
