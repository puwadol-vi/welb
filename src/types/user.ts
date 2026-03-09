/** App user from Postgres (synced from Firebase on login). */
export interface AppUser {
  id: string;
  gmail: string;
  /** "admin" => admin spot/shop/digital; "" => no access */
  role: string;
  /** "admin" => edit all events; "welb" => edit only welb events; "" => no access */
  organizer: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Supabase users row (snake_case). */
export type UserRow = {
  id: string;
  gmail: string;
  role: string;
  organizer: string;
  created_at: string;
  updated_at: string;
};

export function mapRowToAppUser(row: UserRow): AppUser {
  return {
    id: row.id,
    gmail: row.gmail,
    role: row.role ?? "",
    organizer: row.organizer ?? "",
    createdAt: row.created_at ? new Date(row.created_at) : new Date(0),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(0),
  };
}
