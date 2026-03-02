import { drizzle } from "drizzle-orm/postgres-js";
import { sql as drizzleSql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

const sqlClient = postgres(process.env.DATABASE_URL!);

export const db = drizzle(sqlClient, { schema });
export const sql = drizzleSql;

export * from "./schema";
