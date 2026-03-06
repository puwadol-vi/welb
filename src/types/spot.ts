export type SpotType = "shop" | "meetup" | "course";

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
  isSuggested: boolean;
  isVerified: boolean;
  isLocalVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
