import "server-only";
import { count, desc, eq, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "@/db";
import { equipamentos, sugestoes } from "@/db/schema";
import type { StatusSugestao } from "./status";
import type { TipoSugestao } from "./validacao";

// Consultas do painel de sugestões. Toda página que usa estas funções chama
// exigirUsuario() antes.

export type SugestaoPainel = {
  id: string;
  tipo: TipoSugestao;
  status: StatusSugestao;
  nomeEquipamento: string;
  motivo: string;
  nomeCliente: string;
  telefone: string;
  querAviso: boolean;
  criadoEm: Date;
  // aguardar_disponibilidade: o equipamento do catálogo
  equipamento: { id: string; ativo: boolean; disponivel: boolean } | null;
  // atendida: o equipamento que atendeu
  atendidoPor: { id: string; nome: string } | null;
};

const atendido = alias(equipamentos, "atendido");

export async function listarSugestoes(status: StatusSugestao[], limite = 200): Promise<SugestaoPainel[]> {
  const linhas = await getDb()
    .select({
      id: sugestoes.id,
      tipo: sugestoes.tipo,
      status: sugestoes.status,
      nomeEquipamento: sugestoes.nomeEquipamento,
      motivo: sugestoes.motivo,
      nomeCliente: sugestoes.nomeCliente,
      telefone: sugestoes.telefone,
      querAviso: sugestoes.querAviso,
      criadoEm: sugestoes.criadoEm,
      equipamentoId: equipamentos.id,
      equipamentoAtivo: equipamentos.ativo,
      equipamentoDisponivel: equipamentos.disponivel,
      atendidoId: atendido.id,
      atendidoNome: atendido.nome,
    })
    .from(sugestoes)
    .leftJoin(equipamentos, eq(equipamentos.id, sugestoes.equipamentoId))
    .leftJoin(atendido, eq(atendido.id, sugestoes.equipamentoAtendidoId))
    .where(inArray(sugestoes.status, status))
    // Pendentes primeiro; dentro do grupo, as mais recentes.
    .orderBy(sql`${sugestoes.status} = 'pendente' desc`, desc(sugestoes.criadoEm))
    .limit(limite);

  return linhas.map(({ equipamentoId, equipamentoAtivo, equipamentoDisponivel, atendidoId, atendidoNome, ...s }) => ({
    ...s,
    equipamento: equipamentoId ? { id: equipamentoId, ativo: equipamentoAtivo!, disponivel: equipamentoDisponivel! } : null,
    atendidoPor: atendidoId ? { id: atendidoId, nome: atendidoNome! } : null,
  }));
}

export async function contarSugestoesPorStatus(): Promise<Record<StatusSugestao, number>> {
  const linhas = await getDb()
    .select({ status: sugestoes.status, total: count() })
    .from(sugestoes)
    .groupBy(sugestoes.status);
  const contagem: Record<StatusSugestao, number> = { pendente: 0, atendida: 0, descartada: 0 };
  for (const { status, total } of linhas) contagem[status] = total;
  return contagem;
}
