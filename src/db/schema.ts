import {
  pgTable,
  serial,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// ============================================
// SPOTS TABLE
// ============================================

export const spots = pgTable("spots", {
  id: serial("id").primaryKey(),

  // Basic info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("shop"),
  category: varchar("category", { length: 255 }).notNull(),
  region: varchar("region", { length: 255 }).notNull(),

  // Location
  province: varchar("province", { length: 100 }).notNull(),
  provinceTh: varchar("province_th", { length: 255 }),
  district: varchar("district", { length: 255 }),
  districtTh: varchar("district_th", { length: 255 }),
  address: text("address"),
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lng: decimal("lng", { precision: 11, scale: 8 }),
  googleMapLink: text("google_map_link").notNull(),

  // Contact
  phone: varchar("phone", { length: 20 }),
  facebookLink: text("facebook_link"),
  websiteLink: text("website_link"),

  // Metadata
  isSuggested: boolean("is_suggested").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isLocalVerified: boolean("is_local_verified").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// export type SpotInsert = typeof spots.$inferInsert;
// export type SpotSelect = typeof spots.$inferSelect
