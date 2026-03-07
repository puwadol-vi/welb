"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import {
  EventModel,
  CreateEvent,
  EventRow,
  mapRowToEvent,
} from "@/types/event";

function mapRows(rows: EventRow[] | null): EventModel[] {
  if (!rows) return [];
  return rows.map(mapRowToEvent);
}

export async function getEvents(): Promise<EventModel[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: false });
  if (error) throw error;
  return mapRows(data);
}

/** For welb page: split by date = endDate ?? startDate vs now. */
export async function getWelbEvents(): Promise<{
  upcomingEvents: EventModel[];
  pastEvents: EventModel[];
}> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_welb_project", true)
    .order("start_date", { ascending: false });
  if (error) throw error;
  const all = mapRows(data);
  const now = new Date();
  const upcoming: EventModel[] = [];
  const past: EventModel[] = [];
  for (const e of all) {
    const date = e.endDate ? e.endDate : e.startDate;
    if (date >= now) upcoming.push(e);
    else past.push(e);
  }
  upcoming.sort((a, b) => {
    const da = a.endDate ? a.endDate : a.startDate;
    const db = b.endDate ? b.endDate : b.startDate;
    return da.getTime() - db.getTime();
  });
  past.sort((a, b) => {
    const da = a.endDate ? a.endDate : a.startDate;
    const db = b.endDate ? b.endDate : b.startDate;
    return db.getTime() - da.getTime();
  });
  return { upcomingEvents: upcoming, pastEvents: past };
}

/** Non-WelB events whose date (end ?? start) falls within the next 7 days. */
export async function getHighlightEvents(): Promise<EventModel[]> {
  const supabase = createServerClient();
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_welb_project", false)
    .gte("start_date", now.toISOString())
    .lte("end_date", in7Days.toISOString())
    .order("start_date", { ascending: true });
  if (error) throw error;
  const all = mapRows(data);
  return all.filter((e) => {
    const date = e.endDate ?? e.startDate;
    return date >= now && date <= in7Days;
  });
}

export async function createEvent(
  data: CreateEvent,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("events").insert({
      title: data.title,
      description: data.description ?? null,
      spot_id: null,
      type: data.type ?? "meetup",
      price: data.price ?? null,
      currency: data.currency ?? null,
      start_date: data.startDate,
      end_date: data.endDate ?? null,
      location: data.location ?? "",
      organizer_name: data.organizerName ?? "",
      image_url: data.imageUrl ?? null,
      event_url: data.eventUrl ?? null,
      registration_url: data.registrationUrl ?? null,
      participant_count: null,
      is_welb_project: data.isWelBProject ?? false,
      is_market: data.isMarket ?? false,
    });
    if (error) throw error;
    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/welb");
    return { success: true };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<EventModel, "id">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient();
    const update: Record<string, unknown> = {};
    if (data.title != null) update.title = data.title;
    if (data.description != null) update.description = data.description;
    if (data.spotId != null) update.spot_id = data.spotId;
    if (data.type != null) update.type = data.type;
    if (data.price != null) update.price = data.price;
    if (data.currency != null) update.currency = data.currency;
    if (data.startDate != null) update.start_date = data.startDate;
    if (data.endDate != null) update.end_date = data.endDate;
    if (data.location != null) update.location = data.location;
    if (data.organizerName != null) update.organizer_name = data.organizerName;
    if (data.imageUrl != null) update.image_url = data.imageUrl;
    if (data.eventUrl != null) update.event_url = data.eventUrl;
    if (data.registrationUrl != null)
      update.registration_url = data.registrationUrl;
    if (data.participantCount != null)
      update.participant_count = data.participantCount;
    if (data.isWelBProject != null) update.is_welb_project = data.isWelBProject;
    if (data.isMarket != null) update.is_market = data.isMarket;
    if (data.isSuggested != null) update.is_suggested = data.isSuggested;
    if (data.isVerified != null) update.is_verified = data.isVerified;
    if (data.isActive != null) update.is_active = data.isActive;

    const { error } = await supabase.from("events").update(update).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/welb");
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: String(error) };
  }
}
