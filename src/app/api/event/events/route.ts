import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib";

const API_KEY = process.env.SCRAPER_API_KEY;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!API_KEY || apiKey !== API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title");
  const startDate = searchParams.get("startDate");

  if (!title && !startDate) {
    return NextResponse.json(
      { error: "At least one of title or startDate is required" },
      { status: 400 },
    );
  }

  try {
    const supabase = createServerClient();
    let query = supabase.from("events").select("*");

    if (title) {
      query = query.ilike("title", `%${title}%`);
    }
    if (startDate) {
      const day = startDate.slice(0, 10);
      query = query.gte("start_date", `${day}T00:00:00.000Z`).lt("start_date", `${day}T23:59:59.999Z`);
    }

    const { data, error } = await query.order("start_date", { ascending: true });
    if (error) throw error;

    return NextResponse.json({ events: data, count: data.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
