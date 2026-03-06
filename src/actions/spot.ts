"use server";

import { createServerClient, mapRowToSpot, type SpotRow } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { SpotModel } from "@/types/spot";

function mapRows(rows: SpotRow[] | null): SpotModel[] {
  if (!rows) return [];
  return rows.map(mapRowToSpot);
}

export async function getSpots(): Promise<SpotModel[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return mapRows(data);
}

export async function getActiveSpots(): Promise<SpotModel[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .eq("is_active", true)
    .order("id", { ascending: true });
  if (error) throw error;
  return mapRows(data);
}

export async function getSuggestSpots(): Promise<SpotModel[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .eq("is_active", true)
    .eq("is_suggested", true)
    .order("id", { ascending: true });
  if (error) throw error;
  return mapRows(data);
}

export type CreateSpotInput = {
  name: string;
  description: string;
  type: string;
  category: string;
  region: string;
  province: string;
  googleMapLink: string;
  provinceTh?: string | null;
  district?: string | null;
  districtTh?: string | null;
  address?: string | null;
  lat?: string | null;
  lng?: string | null;
  phone?: string | null;
  facebookLink?: string | null;
  websiteLink?: string | null;
};

export async function createSpot(
  data: CreateSpotInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("spots").insert({
      name: data.name,
      description: data.description,
      type: data.type,
      category: data.category,
      region: data.region,
      province: data.province,
      province_th: data.provinceTh ?? null,
      district: data.district ?? null,
      district_th: data.districtTh ?? null,
      address: data.address ?? null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      google_map_link: data.googleMapLink,
      phone: data.phone ?? null,
      facebook_link: data.facebookLink ?? null,
      website_link: data.websiteLink ?? null,
      is_suggested: false,
      is_verified: false,
      is_local_verified: false,
      is_active: true,
    });
    if (error) throw error;
    revalidatePath("/admin/spots");
    revalidatePath("/spots");
    return { success: true };
  } catch (error) {
    console.error("Error creating spot:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateSpot(
  id: number,
  data: Partial<Omit<SpotModel, "id" | "createdAt" | "updatedAt">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name != null) update.name = data.name;
    if (data.description != null) update.description = data.description;
    if (data.type != null) update.type = data.type;
    if (data.category != null) update.category = data.category;
    if (data.region != null) update.region = data.region;
    if (data.province != null) update.province = data.province;
    if (data.provinceTh != null) update.province_th = data.provinceTh;
    if (data.district != null) update.district = data.district;
    if (data.districtTh != null) update.district_th = data.districtTh;
    if (data.address != null) update.address = data.address;
    if (data.lat != null) update.lat = data.lat;
    if (data.lng != null) update.lng = data.lng;
    if (data.googleMapLink != null) update.google_map_link = data.googleMapLink;
    if (data.phone != null) update.phone = data.phone;
    if (data.facebookLink != null) update.facebook_link = data.facebookLink;
    if (data.websiteLink != null) update.website_link = data.websiteLink;
    if (data.isSuggested != null) update.is_suggested = data.isSuggested;
    if (data.isVerified != null) update.is_verified = data.isVerified;
    if (data.isLocalVerified != null) update.is_local_verified = data.isLocalVerified;
    if (data.isActive != null) update.is_active = data.isActive;

    const { error } = await supabase.from("spots").update(update).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/spots");
    revalidatePath("/spots");
    return { success: true };
  } catch (error) {
    console.error("Error updating spot:", error);
    return { success: false, error: String(error) };
  }
}
