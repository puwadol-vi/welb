import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib";
import type { CreateEvent } from "@/types/event";

const API_KEY = process.env.SCRAPER_API_KEY;

function toISO(d: string | Date): string {
  return typeof d === "string" ? d : d.toISOString();
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!API_KEY || apiKey !== API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = body as CreateEvent;

    const requiredFields = ["title", "startDate"] as const;
    for (const field of requiredFields) {
      if (
        payload[field] === undefined ||
        payload[field] === null ||
        payload[field] === ""
      ) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const supabase = createServerClient();
    const { data: newEvent, error } = await supabase
      .from("events")
      .insert({
        title: payload.title,
        description: payload.description ?? null,
        spot_id: null,
        type: payload.type ?? "meetup",
        price: payload.price ?? null,
        currency: payload.currency ?? null,
        start_date: toISO(payload.startDate),
        end_date: payload.endDate != null ? toISO(payload.endDate) : null,
        location: payload.location ?? "",
        organizer_name: payload.organizerName ?? "",
        image_url: payload.imageUrl ?? null,
        event_url: payload.eventUrl ?? null,
        registration_url: payload.registrationUrl ?? null,
        participant_count: payload.participantCount ?? null,
        is_welb_project: payload.isWelBProject ?? false,
        is_market: payload.isMarket ?? false,
        is_suggested: false,
        is_verified: false,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      action: "created",
      event: newEvent,
      message: "New event created (pending verification)",
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
