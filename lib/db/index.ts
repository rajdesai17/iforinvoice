import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql as drizzleSql } from "drizzle-orm";
import * as schema from "./schema";

const sqlClient = neon(process.env.DATABASE_URL!);

export const db = drizzle(sqlClient, { schema });
export const sql = drizzleSql;

export * from "./schema";
