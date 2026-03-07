export type SpotType = "shop" | "event" | "meetup" | "course";

export type RegionModel = {
  id: string;
  name: string;
  province: string | null;
  district: string | null;
};

export type CategoryModel = {
  id: string;
  category: string;
  subCategory: string;
};

export type SpotModel = {
  id: number;
  name: string;
  description: string;
  type: string;
  category: string;
  region: string;
  // addition
  province: string;
  provinceTh: string | null;
  district: string | null;
  districtTh: string | null;
  address: string | null;
  lat: string | null;
  lng: string | null;
  googleMapLink: string;
  phone: string | null;
  facebookLink: string | null;
  websiteLink: string | null;
  // Metadata
  isSuggested: boolean;
  isVerified: boolean;
  isLocalVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSpot = {
  // id: number;
  name: string;
  description: string;
  type: string;
  category: string;
  region: string;
  // addition
  province: string;
  provinceTh: string | null;
  district: string | null;
  districtTh: string | null;
  address: string | null;
  lat: string | null;
  lng: string | null;
  googleMapLink: string;
  phone: string | null;
  facebookLink: string | null;
  websiteLink: string | null;
};

/** Supabase spots row (snake_case). */
export type SpotRow = {
  id: number;
  name: string;
  description: string;
  type: string;
  category: string;
  region: string;
  province: string;
  province_th: string | null;
  district: string | null;
  district_th: string | null;
  address: string | null;
  lat: string | null;
  lng: string | null;
  google_map_link: string;
  phone: string | null;
  facebook_link: string | null;
  website_link: string | null;
  is_suggested: boolean;
  is_verified: boolean;
  is_local_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

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
  };
}
