import "server-only";
import { asc, count, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { equipamentoFotos, equipamentos } from "@/db/schema";
import { env } from "@/lib/env";
import { urlFoto } from "@/lib/fotos";
import { UUID } from "./validacao";

// Consultas do painel: ao contrário do catálogo público, incluem os
// equipamentos desativados. Toda página que usa estas funções chama
// exigirUsuario() antes.

export type EquipamentoPainel = {
  id: string;
  nome: string;
  categoria: string;
  disponivel: boolean;
  ativo: boolean;
  capa?: string;
  totalFotos: number;
  atualizadoEm: Date;
};

const url = (caminho: string) => urlFoto(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_BUCKET_FOTOS, caminho);

export async function listarNoPainel(): Promise<EquipamentoPainel[]> {
  const db = getDb();
  // Primeira foto (menor ordem) e total de fotos de cada equipamento.
  const fotos = db
    .select({
      equipamentoId: equipamentoFotos.equipamentoId,
      capa: sql<string>`(array_agg(${equipamentoFotos.storagePath} order by ${equipamentoFotos.ordem}, ${equipamentoFotos.id}))[1]`.as("capa"),
      total: count().as("total"),
    })
    .from(equipamentoFotos)
    .groupBy(equipamentoFotos.equipamentoId)
    .as("fotos");

  const linhas = await db
    .select({
      id: equipamentos.id,
      nome: equipamentos.nome,
      categoria: equipamentos.categoria,
      disponivel: equipamentos.disponivel,
      ativo: equipamentos.ativo,
      atualizadoEm: equipamentos.atualizadoEm,
      capa: fotos.capa,
      total: fotos.total,
    })
    .from(equipamentos)
    .leftJoin(fotos, eq(fotos.equipamentoId, equipamentos.id))
    .orderBy(desc(equipamentos.ativo), asc(equipamentos.nome));

  return linhas.map(({ capa, total, ...l }) => ({
    ...l,
    capa: capa ? url(capa) : undefined,
    totalFotos: Number(total ?? 0),
  }));
}

export type FotoPainel = { id: string; url: string; caminho: string };

export type EquipamentoEdicao = {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  disponivel: boolean;
  ativo: boolean;
  fotos: FotoPainel[];
};

export async function obterParaEdicao(id: string): Promise<EquipamentoEdicao | null> {
  if (!UUID.test(id)) return null;
  const db = getDb();
  const [linha] = await db
    .select({
      id: equipamentos.id,
      nome: equipamentos.nome,
      categoria: equipamentos.categoria,
      descricao: equipamentos.descricao,
      disponivel: equipamentos.disponivel,
      ativo: equipamentos.ativo,
    })
    .from(equipamentos)
    .where(eq(equipamentos.id, id));
  if (!linha) return null;
  const fotos = await db
    .select({ id: equipamentoFotos.id, caminho: equipamentoFotos.storagePath })
    .from(equipamentoFotos)
    .where(eq(equipamentoFotos.equipamentoId, id))
    .orderBy(asc(equipamentoFotos.ordem), asc(equipamentoFotos.id));
  return { ...linha, fotos: fotos.map((f) => ({ ...f, url: url(f.caminho) })) };
}

// Categorias já usadas (inclusive em desativados), para sugerir no formulário.
export async function listarTodasCategorias(): Promise<string[]> {
  const linhas = await getDb()
    .selectDistinct({ categoria: equipamentos.categoria })
    .from(equipamentos)
    .orderBy(asc(equipamentos.categoria));
  return linhas.map((l) => l.categoria);
}
