import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

// Uma conexão por instância. `prepare: false` é exigido pelo pooler do
// Supabase em modo transação.
const globalParaDb = globalThis as unknown as {
  conexao?: ReturnType<typeof postgres>;
};

const conexao =
  globalParaDb.conexao ??
  postgres(env.DATABASE_URL, { prepare: false, max: 5 });

if (process.env.NODE_ENV !== "production") globalParaDb.conexao = conexao;

export const db = drizzle(conexao, { schema });
