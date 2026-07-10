/** Neon serverless client + Drizzle. OWNER: Dev A. Import `db` từ đây, đừng tự tạo connection. */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
