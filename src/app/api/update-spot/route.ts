import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const API_KEY = process.env.SCRAPER_API_KEY;

interface SpotPayload {
  name: string;
  description: string;
  type: string;
  category: string;
  region: string;
  province: string;
  googleMapLink: string;
  provinceTh?: string;
  district?: string;
  districtTh?: string;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  facebookLink?: string;
  websiteLink?: string;
  id?: number;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!API_KEY || apiKey !== API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = body as SpotPayload;

    const requiredFields = [
      "name",
      "description",
      "type",
      "category",
      "region",
      "province",
      "googleMapLink",
    ];
    for (const field of requiredFields) {
      if (!payload[field as keyof SpotPayload]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const supabase = createServerClient();
    const { data: newSpot, error } = await supabase
      .from("spots")
      .insert({
        name: payload.name,
        description: payload.description,
        type: payload.type,
        category: payload.category,
        region: payload.region,
        province: payload.province,
        province_th: payload.provinceTh ?? null,
        district: payload.district ?? null,
        district_th: payload.districtTh ?? null,
        address: payload.address ?? null,
        lat: payload.lat?.toString() ?? null,
        lng: payload.lng?.toString() ?? null,
        google_map_link: payload.googleMapLink,
        phone: payload.phone ?? null,
        facebook_link: payload.facebookLink ?? null,
        website_link: payload.websiteLink ?? null,
        is_suggested: false,
        is_verified: false,
        is_local_verified: false,
        is_active: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      action: "created",
      spot: newSpot,
      message: "New unverified spot created",
      previousSpotId: null,
    });
  } catch (error) {
    console.error("Error updating spot:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!API_KEY || apiKey !== API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: "ok",
    message: "Spot update API is ready",
  });
}
