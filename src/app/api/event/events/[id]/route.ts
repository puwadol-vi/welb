import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib";

const API_KEY = process.env.SCRAPER_API_KEY;

function auth(request: NextRequest) {
  const apiKey = request.headers.get("authorization")?.replace("Bearer ", "");
  return API_KEY && apiKey === API_KEY;
}

function toISO(d: string | Date): string {
  return typeof d === "string" ? d : d.toISOString();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!auth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!auth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();

    // Soft update: always creates a new unverified event referencing the old one.
    // The old event is never mutated.
    const supabase = createServerClient();

    const { data: old, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const dataFields = [
      "title", "description", "type", "price", "currency",
      "startDate", "endDate", "location", "organizerName",
      "imageUrl", "eventUrl", "registrationUrl", "participantCount",
      "isWelBProject", "isMarket",
    ];
    const hasDataFields = dataFields.some((f) => body[f] !== undefined);
    if (!hasDataFields) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 },
      );
    }

    const { data: newEvent, error: insertError } = await supabase
      .from("events")
      .insert({
        title:             body.title             ?? old.title,
        description:       body.description       !== undefined ? body.description       : old.description,
        type:              body.type              ?? old.type,
        price:             body.price             !== undefined ? body.price             : old.price,
        currency:          body.currency          !== undefined ? body.currency          : old.currency,
        start_date:        body.startDate         ? toISO(body.startDate)               : old.start_date,
        end_date:          body.endDate           !== undefined ? (body.endDate != null ? toISO(body.endDate) : null) : old.end_date,
        location:          body.location          ?? old.location,
        organizer_name:    body.organizerName     ?? old.organizer_name,
        image_url:         body.imageUrl          !== undefined ? body.imageUrl          : old.image_url,
        event_url:         body.eventUrl          !== undefined ? body.eventUrl          : old.event_url,
        registration_url:  body.registrationUrl   !== undefined ? body.registrationUrl   : old.registration_url,
        participant_count: body.participantCount  !== undefined ? body.participantCount  : old.participant_count,
        spot_id:           old.spot_id,
        is_welb_project:   body.isWelBProject     !== undefined ? body.isWelBProject     : old.is_welb_project,
        is_market:         body.isMarket          !== undefined ? body.isMarket          : old.is_market,
        is_suggested:      false,
        is_verified:       false,
        is_active:         true,
        ref_id:            id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      action: "soft-updated",
      oldId: id,
      event: newEvent,
      message: "New event version created (pending verification)",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
