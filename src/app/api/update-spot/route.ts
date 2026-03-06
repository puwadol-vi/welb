export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { spots } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// API Key for external scraper authentication
const API_KEY = process.env.SCRAPER_API_KEY;

interface SpotPayload {
  // Required fields
  name: string;
  description: string;
  type: string;
  category: string;
  region: string;
  province: string;
  googleMapLink: string;

  // Optional location fields
  provinceTh?: string;
  district?: string;
  districtTh?: string;
  address?: string;
  lat?: number;
  lng?: number;

  // Optional contact fields
  phone?: string;
  facebookLink?: string;
  websiteLink?: string;

  // For updates - match by googleMapLink or id
  id?: number;
}

export async function POST(request: NextRequest) {
  // Verify API key
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!API_KEY || apiKey !== API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = body as SpotPayload;

    // Validate required fields
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

    const spotValues = {
      name: payload.name,
      description: payload.description,
      type: payload.type,
      category: payload.category,
      region: payload.region,
      province: payload.province,
      provinceTh: payload.provinceTh ?? null,
      district: payload.district ?? null,
      districtTh: payload.districtTh ?? null,
      address: payload.address ?? null,
      lat: payload.lat?.toString() ?? null,
      lng: payload.lng?.toString() ?? null,
      googleMapLink: payload.googleMapLink,
      phone: payload.phone ?? null,
      facebookLink: payload.facebookLink ?? null,
      websiteLink: payload.websiteLink ?? null,
    };

    // CREATE NEW SPOT
    const [newSpot] = await db
      .insert(spots)
      .values({
        ...spotValues,
        isSuggested: false,
        isVerified: false,
        isLocalVerified: false,
        isActive: false,
      })
      .returning();

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

// GET endpoint to check API status
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
