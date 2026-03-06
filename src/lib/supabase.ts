import { createClient } from "@supabase/supabase-js"
import type { SpotModel } from "@/types/spot"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function getSupabase() {
  if (!url || !key) {
    throw new Error(
      "Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    )
  }
  return createClient(url, key)
}

/** Server-only Supabase client (use in Server Actions, API routes, RSC). */
export function createServerClient() {
  return getSupabase()
}

/** Supabase spots row (snake_case). */
export type SpotRow = {
  id: number
  name: string
  description: string
  type: string
  category: string
  region: string
  province: string
  province_th: string | null
  district: string | null
  district_th: string | null
  address: string | null
  lat: string | null
  lng: string | null
  google_map_link: string
  phone: string | null
  facebook_link: string | null
  website_link: string | null
  is_suggested: boolean
  is_verified: boolean
  is_local_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export function mapRowToSpot(row: SpotRow): SpotModel {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    category: row.category,
    region: row.region,
    province: row.province,
    provinceTh: row.province_th,
    district: row.district,
    districtTh: row.district_th,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    googleMapLink: row.google_map_link,
    phone: row.phone,
    facebookLink: row.facebook_link,
    websiteLink: row.website_link,
    isSuggested: row.is_suggested,
    isVerified: row.is_verified,
    isLocalVerified: row.is_local_verified,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}
