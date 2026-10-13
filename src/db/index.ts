import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

function conectar() {
  // `prepare: false` é exigido pelo pooler do Supabase em modo transação.
  const conexao = postgres(env.DATABASE_URL, { prepare: false, max: 5 });
  return drizzle(conexao, { schema });
}

type Db = ReturnType<typeof conectar>;

// Uma conexão por instância, criada no primeiro uso: importar este módulo não
// exige DATABASE_URL, então o build roda sem credenciais.
const globalParaDb = globalThis as unknown as { db?: Db };

export function getDb(): Db {
  globalParaDb.db ??= conectar();
  return globalParaDb.db;
}
