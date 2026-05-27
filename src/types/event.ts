import { SpotModel } from "./spot";

export const EVENT_TYPES = [
  "meetup",
  "course",
  "lightning market",
  "speaker",
  "project",
];

export interface EventModel {
  id: string;
  title: string;
  description: string | null;
  spotId: number | null;
  type: string; // default 'meetup'
  price: number | null;
  currency: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string;
  organizerName: string;
  imageUrl: string | null;
  eventUrl: string | null;
  registrationUrl: string | null;
  participantCount: number | null;
  isWelBProject: boolean;
  isMarket: boolean;
  // Metadata
  isSuggested: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEvent {
  // id: string
  title: string;
  description: string | null;
  // spotId: number | null
  type: string; // default 'meetup'
  price: number | null;
  currency: string | null;
  startDate: string;
  endDate: string | null;
  location: string;
  organizerName: string;
  imageUrl: string | null;
  eventUrl: string | null;
  registrationUrl: string | null;
  participantCount: number | null;
  isWelBProject: boolean;
  isMarket: boolean;
}

/** Supabase events row (snake_case). */
export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  spot_id: number | null;
  type: string;
  price: number | null;
  currency: string | null;
  start_date: string;
  end_date: string | null;
  location: string;
  organizer_name: string;
  image_url: string | null;
  event_url: string | null;
  registration_url: string | null;
  participant_count: number | null;
  is_welb_project: boolean;
  is_market: boolean;
  is_suggested?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export function mapRowToEvent(row: EventRow): EventModel {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    spotId: row.spot_id,
    type: row.type,
    price: row.price != null ? Number(row.price) : null,
    currency: row.currency,
    startDate: row.start_date ? new Date(row.start_date) : new Date(0),
    endDate: row.end_date ? new Date(row.end_date) : new Date(0),
    location: row.location,
    organizerName: row.organizer_name,
    imageUrl: row.image_url,
    eventUrl: row.event_url,
    registrationUrl: row.registration_url,
    participantCount: row.participant_count,
    isWelBProject: row.is_welb_project,
    isMarket: row.is_market,
    isSuggested: row.is_suggested ?? false,
    isVerified: row.is_verified ?? false,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(0),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(0),
  };
}
