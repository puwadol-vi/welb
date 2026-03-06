"use server";

import { db } from "@/lib/db";
import { spots } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SpotModel } from "@/types/spot";

export async function getSpots(): Promise<SpotModel[]> {
  return await db
    .select({
      id: spots.id,
      name: spots.name,
      description: spots.description,
      type: spots.type,
      category: spots.category,
      region: spots.region,
      province: spots.province,
      provinceTh: spots.provinceTh,
      district: spots.district,
      districtTh: spots.districtTh,
      address: spots.address,
      lat: spots.lat,
      lng: spots.lng,
      googleMapLink: spots.googleMapLink,
      phone: spots.phone,
      facebookLink: spots.facebookLink,
      websiteLink: spots.websiteLink,
      isSuggested: spots.isSuggested,
      isVerified: spots.isVerified,
      isLocalVerified: spots.isLocalVerified,
      isActive: spots.isActive,
      createdAt: spots.createdAt,
      updatedAt: spots.updatedAt,
    })
    .from(spots)
    .orderBy(asc(spots.id));
}

export async function getActiveSpots(): Promise<SpotModel[]> {
  return await db
    .select({
      id: spots.id,
      name: spots.name,
      description: spots.description,
      type: spots.type,
      category: spots.category,
      region: spots.region,
      province: spots.province,
      provinceTh: spots.provinceTh,
      district: spots.district,
      districtTh: spots.districtTh,
      address: spots.address,
      lat: spots.lat,
      lng: spots.lng,
      googleMapLink: spots.googleMapLink,
      phone: spots.phone,
      facebookLink: spots.facebookLink,
      websiteLink: spots.websiteLink,
      isSuggested: spots.isSuggested,
      isVerified: spots.isVerified,
      isLocalVerified: spots.isLocalVerified,
      isActive: spots.isActive,
      createdAt: spots.createdAt,
      updatedAt: spots.updatedAt,
    })
    .from(spots)
    .where(eq(spots.isActive, true))
    .orderBy(asc(spots.id));
}

export async function getSuggestSpots(): Promise<SpotModel[]> {
  return await db
    .select({
      id: spots.id,
      name: spots.name,
      description: spots.description,
      type: spots.type,
      category: spots.category,
      region: spots.region,
      province: spots.province,
      provinceTh: spots.provinceTh,
      district: spots.district,
      districtTh: spots.districtTh,
      address: spots.address,
      lat: spots.lat,
      lng: spots.lng,
      googleMapLink: spots.googleMapLink,
      phone: spots.phone,
      facebookLink: spots.facebookLink,
      websiteLink: spots.websiteLink,
      isSuggested: spots.isSuggested,
      isVerified: spots.isVerified,
      isLocalVerified: spots.isLocalVerified,
      isActive: spots.isActive,
      createdAt: spots.createdAt,
      updatedAt: spots.updatedAt,
    })
    .from(spots)
    .where(eq(spots.isActive, true) && eq(spots.isSuggested, true))
    .orderBy(asc(spots.id));
}

export async function updateSpot(
  id: number,
  data: Partial<Omit<SpotModel, "id" | "createdAt" | "updatedAt">>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(spots)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(spots.id, id));

    revalidatePath("/admin/spots");
    revalidatePath("/spots");
    return { success: true };
  } catch (error) {
    console.error("Error updating spot:", error);
    return { success: false, error: String(error) };
  }
}
