import "server-only";
import { asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { equipamentos, solicitacaoEquipamentos, solicitacoes } from "@/db/schema";
import { UUID } from "@/lib/equipamentos/validacao";
import type { StatusPedido } from "./status";

// Consultas do painel de pedidos. Toda página que usa estas funções chama
// exigirUsuario() antes.

export type PedidoResumo = {
  id: string;
  nomeCliente: string;
  telefone: string;
  dataInicio: string;
  dataFim: string;
  status: StatusPedido;
  criadoEm: Date;
  equipamentos: string[];
};

export async function listarPedidos(status: StatusPedido[], limite = 200): Promise<PedidoResumo[]> {
  const db = getDb();
  const linhas = await db
    .select({
      id: solicitacoes.id,
      nomeCliente: solicitacoes.nomeCliente,
      telefone: solicitacoes.telefone,
      dataInicio: solicitacoes.dataInicio,
      dataFim: solicitacoes.dataFim,
      status: solicitacoes.status,
      criadoEm: solicitacoes.criadoEm,
      equipamentos: sql<string[]>`coalesce(array_agg(${equipamentos.nome} order by ${equipamentos.nome}) filter (where ${equipamentos.id} is not null), '{}')`,
    })
    .from(solicitacoes)
    .leftJoin(solicitacaoEquipamentos, eq(solicitacaoEquipamentos.solicitacaoId, solicitacoes.id))
    .leftJoin(equipamentos, eq(equipamentos.id, solicitacaoEquipamentos.equipamentoId))
    .where(inArray(solicitacoes.status, status))
    .groupBy(solicitacoes.id)
    // Novos primeiro (são os que esperam resposta); dentro do grupo, os mais recentes.
    .orderBy(sql`${solicitacoes.status} = 'nova' desc`, desc(solicitacoes.criadoEm))
    .limit(limite);
  return linhas;
}

export async function contarPorStatus(): Promise<Record<StatusPedido, number>> {
  const linhas = await getDb()
    .select({ status: solicitacoes.status, total: count() })
    .from(solicitacoes)
    .groupBy(solicitacoes.status);
  const contagem: Record<StatusPedido, number> = { nova: 0, em_atendimento: 0, fechada: 0, perdida: 0 };
  for (const { status, total } of linhas) contagem[status] = total;
  return contagem;
}

export type PedidoDetalhe = {
  id: string;
  nomeCliente: string;
  telefone: string;
  servico: string;
  dataInicio: string;
  dataFim: string;
  materiais: string[];
  aceitaWhatsapp: boolean;
  status: StatusPedido;
  criadoEm: Date;
  atualizadoEm: Date;
  equipamentos: { id: string; nome: string; categoria: string; ativo: boolean; disponivel: boolean }[];
};

export async function obterPedido(id: string): Promise<PedidoDetalhe | null> {
  if (!UUID.test(id)) return null;
  const db = getDb();
  const [pedido] = await db
    .select({
      id: solicitacoes.id,
      nomeCliente: solicitacoes.nomeCliente,
      telefone: solicitacoes.telefone,
      servico: solicitacoes.servico,
      dataInicio: solicitacoes.dataInicio,
      dataFim: solicitacoes.dataFim,
      materiais: solicitacoes.materiaisSugeridos,
      aceitaWhatsapp: solicitacoes.aceitaWhatsapp,
      status: solicitacoes.status,
      criadoEm: solicitacoes.criadoEm,
      atualizadoEm: solicitacoes.atualizadoEm,
    })
    .from(solicitacoes)
    .where(eq(solicitacoes.id, id));
  if (!pedido) return null;

  const itens = await db
    .select({
      id: equipamentos.id,
      nome: equipamentos.nome,
      categoria: equipamentos.categoria,
      ativo: equipamentos.ativo,
      disponivel: equipamentos.disponivel,
    })
    .from(solicitacaoEquipamentos)
    .innerJoin(equipamentos, eq(equipamentos.id, solicitacaoEquipamentos.equipamentoId))
    .where(eq(solicitacaoEquipamentos.solicitacaoId, id))
    .orderBy(asc(equipamentos.nome));
  return { ...pedido, equipamentos: itens };
}
