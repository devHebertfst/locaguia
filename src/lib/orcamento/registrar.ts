import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { equipamentos, solicitacaoEquipamentos, solicitacoes } from "@/db/schema";
import type { Solicitacao } from "./validacao";

export type ResultadoRegistro =
  | { ok: true; id: string; nomesEquipamentos: string[] }
  | { ok: false; motivo: "equipamento_indisponivel"; indisponiveis: string[] };

// Grava a solicitação e os equipamentos numa transação. Só aceita equipamentos
// ativos e disponíveis no momento do pedido.
export async function registrarSolicitacao(s: Solicitacao): Promise<ResultadoRegistro> {
  return getDb().transaction(async (tx) => {
    const encontrados = await tx
      .select({ id: equipamentos.id, nome: equipamentos.nome })
      .from(equipamentos)
      .where(
        and(
          inArray(equipamentos.id, s.equipamentos),
          eq(equipamentos.ativo, true),
          eq(equipamentos.disponivel, true),
        ),
      )
      .orderBy(asc(equipamentos.nome));

    if (encontrados.length !== s.equipamentos.length) {
      const ok = new Set(encontrados.map((e) => e.id));
      const faltando = s.equipamentos.filter((id) => !ok.has(id));
      const nomes = await tx
        .select({ nome: equipamentos.nome })
        .from(equipamentos)
        .where(inArray(equipamentos.id, faltando));
      return {
        ok: false,
        motivo: "equipamento_indisponivel",
        indisponiveis: nomes.map((n) => n.nome),
      };
    }

    const [criada] = await tx
      .insert(solicitacoes)
      .values({
        nomeCliente: s.nome,
        telefone: s.telefone,
        servico: s.servico,
        dataInicio: s.dataInicio,
        dataFim: s.dataFim,
        materiaisSugeridos: s.materiais,
        aceitaWhatsapp: s.aceitaWhatsapp,
      })
      .returning({ id: solicitacoes.id });

    await tx
      .insert(solicitacaoEquipamentos)
      .values(encontrados.map((e) => ({ solicitacaoId: criada.id, equipamentoId: e.id })));

    return { ok: true, id: criada.id, nomesEquipamentos: encontrados.map((e) => e.nome) };
  });
}
