import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    const client = postgres(process.env.DATABASE_URL, {
      ssl: process.env.NODE_ENV === "production" ? "require" : false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
    _db = drizzle(client, { schema })
  }
  return _db
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return (getDb() as any)[prop]
  },
})
