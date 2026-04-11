import { PrismaClient } from "@/lib/generated/prisma/client";
import { neon } from "@neondatabase/serverless";
import { PrismaPg } from "@prisma/adapter-pg";

export const sql = neon(process.env.DATABASE_URL!);

declare global {
  var client: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const client =
  global.client ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") global.client = client;

export default client;
