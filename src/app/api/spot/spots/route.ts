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
  const search = searchParams.get("search");

  if (!search) {
    return NextResponse.json(
      { error: "search query param is required" },
      { status: 400 },
    );
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("spots")
      .select("id, name, province, region, type, category, is_active, is_verified")
      .ilike("name", `%${search}%`)
      .order("name", { ascending: true })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ spots: data, count: data.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
