import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Migrações usam a conexão direta (porta 5432), não o pooler.
    url: process.env.DATABASE_URL_DIRETA ?? process.env.DATABASE_URL ?? "",
  },
});
