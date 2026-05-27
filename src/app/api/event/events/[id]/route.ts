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

    const update: Record<string, unknown> = {};
    if (body.title !== undefined)            update.title             = body.title;
    if (body.description !== undefined)      update.description       = body.description;
    if (body.type !== undefined)             update.type              = body.type;
    if (body.price !== undefined)            update.price             = body.price;
    if (body.currency !== undefined)         update.currency          = body.currency;
    if (body.startDate !== undefined)        update.start_date        = toISO(body.startDate);
    if (body.endDate !== undefined)          update.end_date          = body.endDate != null ? toISO(body.endDate) : null;
    if (body.location !== undefined)         update.location          = body.location;
    if (body.organizerName !== undefined)    update.organizer_name    = body.organizerName;
    if (body.imageUrl !== undefined)         update.image_url         = body.imageUrl;
    if (body.eventUrl !== undefined)         update.event_url         = body.eventUrl;
    if (body.registrationUrl !== undefined)  update.registration_url  = body.registrationUrl;
    if (body.participantCount !== undefined) update.participant_count = body.participantCount;
    if (body.spotId !== undefined)           update.spot_id           = body.spotId;
    if (body.isWelBProject !== undefined)    update.is_welb_project   = body.isWelBProject;
    if (body.isMarket !== undefined)         update.is_market         = body.isMarket;
    if (body.isActive !== undefined)         update.is_active         = body.isActive;
    if (body.isVerified !== undefined)       update.is_verified       = body.isVerified;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 },
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("events")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const status = error.code === "PGRST116" ? 404 : 500;
      const message = error.code === "PGRST116" ? "Event not found" : "Update failed";
      return NextResponse.json({ error: message, details: error.message }, { status });
    }

    return NextResponse.json({ success: true, event: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
