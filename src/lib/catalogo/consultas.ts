import "server-only";
import { and, asc, desc, eq, inArray, or, sql, type AnyColumn } from "drizzle-orm";
import { getDb } from "@/db";
import { equipamentoFotos, equipamentos } from "@/db/schema";
import { env } from "@/lib/env";
import { urlFoto } from "@/lib/fotos";
import { padraoBusca, type FiltrosCatalogo } from "./filtros";

export type EquipamentoCatalogo = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  disponivel: boolean;
  fotos: string[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function contem(coluna: AnyColumn, padrao: string) {
  return sql`public.sem_acento(${coluna}) like public.sem_acento(${padrao})`;
}

async function fotosPorEquipamento(ids: string[]): Promise<Map<string, string[]>> {
  const mapa = new Map<string, string[]>();
  if (ids.length === 0) return mapa;
  const linhas = await getDb()
    .select({ equipamentoId: equipamentoFotos.equipamentoId, caminho: equipamentoFotos.storagePath })
    .from(equipamentoFotos)
    .where(inArray(equipamentoFotos.equipamentoId, ids))
    .orderBy(asc(equipamentoFotos.ordem), asc(equipamentoFotos.id));
  for (const { equipamentoId, caminho } of linhas) {
    const url = urlFoto(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_BUCKET_FOTOS, caminho);
    mapa.set(equipamentoId, [...(mapa.get(equipamentoId) ?? []), url]);
  }
  return mapa;
}

// Equipamentos ativos do catálogo público. Indisponíveis aparecem depois dos disponíveis.
export async function listarEquipamentos(filtros: FiltrosCatalogo): Promise<EquipamentoCatalogo[]> {
  const condicoes = [eq(equipamentos.ativo, true)];
  if (filtros.categoria) condicoes.push(eq(equipamentos.categoria, filtros.categoria));
  if (filtros.busca) {
    const padrao = padraoBusca(filtros.busca);
    condicoes.push(
      or(
        contem(equipamentos.nome, padrao),
        contem(equipamentos.descricao, padrao),
        contem(equipamentos.categoria, padrao),
      )!,
    );
  }

  const linhas = await getDb()
    .select({
      id: equipamentos.id,
      nome: equipamentos.nome,
      descricao: equipamentos.descricao,
      categoria: equipamentos.categoria,
      disponivel: equipamentos.disponivel,
    })
    .from(equipamentos)
    .where(and(...condicoes))
    .orderBy(desc(equipamentos.disponivel), asc(equipamentos.nome));

  const fotos = await fotosPorEquipamento(linhas.map((l) => l.id));
  return linhas.map((l) => ({ ...l, fotos: fotos.get(l.id) ?? [] }));
}

export async function listarCategorias(): Promise<string[]> {
  const linhas = await getDb()
    .selectDistinct({ categoria: equipamentos.categoria })
    .from(equipamentos)
    .where(eq(equipamentos.ativo, true))
    .orderBy(asc(equipamentos.categoria));
  return linhas.map((l) => l.categoria);
}

export type OpcaoEquipamento = { id: string; nome: string; categoria: string };

// Equipamentos que podem entrar num pedido de orçamento: ativos e disponíveis.
export async function listarDisponiveis(): Promise<OpcaoEquipamento[]> {
  return getDb()
    .select({ id: equipamentos.id, nome: equipamentos.nome, categoria: equipamentos.categoria })
    .from(equipamentos)
    .where(and(eq(equipamentos.ativo, true), eq(equipamentos.disponivel, true)))
    .orderBy(asc(equipamentos.categoria), asc(equipamentos.nome));
}

// Catálogo enviado ao assistente: todos os ativos, disponíveis primeiro.
export async function listarParaAssistente() {
  return getDb()
    .select({
      id: equipamentos.id,
      nome: equipamentos.nome,
      categoria: equipamentos.categoria,
      descricao: equipamentos.descricao,
      disponivel: equipamentos.disponivel,
    })
    .from(equipamentos)
    .where(eq(equipamentos.ativo, true))
    .orderBy(desc(equipamentos.disponivel), asc(equipamentos.categoria), asc(equipamentos.nome));
}

// Detalhe de um equipamento ativo; null se não existir, estiver desativado ou o id for inválido.
export async function obterEquipamento(id: string): Promise<EquipamentoCatalogo | null> {
  if (!UUID.test(id)) return null;
  const [linha] = await getDb()
    .select({
      id: equipamentos.id,
      nome: equipamentos.nome,
      descricao: equipamentos.descricao,
      categoria: equipamentos.categoria,
      disponivel: equipamentos.disponivel,
    })
    .from(equipamentos)
    .where(and(eq(equipamentos.id, id), eq(equipamentos.ativo, true)));
  if (!linha) return null;
  const fotos = await fotosPorEquipamento([linha.id]);
  return { ...linha, fotos: fotos.get(linha.id) ?? [] };
}
