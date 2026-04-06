import { db } from "@/server/db";
import { sql } from "drizzle-orm";
import { Logger } from "../services/logger.service";

/**
 * Pings the database to check connectivity.
 * @returns {Promise<boolean>} True if the database is reachable, false otherwise.
 */
export async function pingDb(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    Logger.error("Database ping failed:", { error: String(error) });
    return false;
  }
}
