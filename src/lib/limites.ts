import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { limitesUso } from "@/db/schema";
import { env } from "@/lib/env";

export type Janela = "hora" | "dia";

// Início da janela fixa que contém `agora` (em UTC).
export function inicioJanela(agora: Date, janela: Janela): Date {
  const inicio = new Date(agora);
  inicio.setUTCMinutes(0, 0, 0);
  if (janela === "dia") inicio.setUTCHours(0);
  return inicio;
}

// Conta mais um uso de `chave` na janela atual e diz se ainda está dentro do
// limite. O incremento é atômico (upsert), então requisições simultâneas não
// passam do limite.
export async function consumirLimite(
  chave: string,
  maximo: number,
  janela: Janela,
  agora: Date = new Date(),
): Promise<boolean> {
  const [linha] = await getDb()
    .insert(limitesUso)
    .values({ chave: env.LIMITES_PREFIXO + chave, janelaInicio: inicioJanela(agora, janela), contador: 1 })
    .onConflictDoUpdate({
      target: [limitesUso.chave, limitesUso.janelaInicio],
      set: { contador: sql`${limitesUso.contador} + 1` },
    })
    .returning({ contador: limitesUso.contador });
  return linha.contador <= maximo;
}
