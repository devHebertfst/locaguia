import "server-only";
import { and, eq, inArray, notExists } from "drizzle-orm";
import type { Transacao } from "@/db";
import { notificacoes, solicitacaoEquipamentos, solicitacoes, sugestoes } from "@/db/schema";
import { enfileirarAvisos } from "./fila";
import { avisoEquipamentoDesativado, avisoEquipamentoDisponivel, efeitosDaMudanca } from "./templates";

type Equipamento = { id: string; nome: string; ativo: boolean; disponivel: boolean };

// Roda na mesma transação que mudou o equipamento. Devolve quantos avisos
// entraram na fila, para quem chamou disparar o envio depois da resposta.
export async function aplicarEfeitosDaMudanca(tx: Transacao, antes: Equipamento, depois: Equipamento): Promise<number> {
  const { voltou, desativado } = efeitosDaMudanca(antes, depois);
  let avisos = 0;
  if (voltou) avisos += await avisarQuemAguardava(tx, depois);
  if (desativado) avisos += await avisarPedidosAbertos(tx, depois);
  return avisos;
}

// "Avise-me quando estiver disponível": todas as sugestões pendentes deste
// equipamento são atendidas; quem pediu aviso recebe.
async function avisarQuemAguardava(tx: Transacao, equipamento: Equipamento): Promise<number> {
  const atendidas = await tx
    .update(sugestoes)
    .set({ status: "atendida", equipamentoAtendidoId: equipamento.id })
    .where(
      and(
        eq(sugestoes.tipo, "aguardar_disponibilidade"),
        eq(sugestoes.status, "pendente"),
        eq(sugestoes.equipamentoId, equipamento.id),
      ),
    )
    .returning({ id: sugestoes.id, nomeCliente: sugestoes.nomeCliente, telefone: sugestoes.telefone, querAviso: sugestoes.querAviso });
  return enfileirarAvisos(
    tx,
    atendidas.filter((s) => s.querAviso).map((s) => avisoEquipamentoDisponivel(s, equipamento)),
  );
}

// Pedidos em aberto (novos ou em atendimento) com este equipamento, de quem
// aceitou avisos. Um aviso por pedido e equipamento, mesmo que ele seja
// desativado, reativado e desativado de novo.
async function avisarPedidosAbertos(tx: Transacao, equipamento: Equipamento): Promise<number> {
  const pedidos = await tx
    .select({ id: solicitacoes.id, nomeCliente: solicitacoes.nomeCliente, telefone: solicitacoes.telefone })
    .from(solicitacoes)
    .innerJoin(solicitacaoEquipamentos, eq(solicitacaoEquipamentos.solicitacaoId, solicitacoes.id))
    .where(
      and(
        eq(solicitacaoEquipamentos.equipamentoId, equipamento.id),
        inArray(solicitacoes.status, ["nova", "em_atendimento"]),
        eq(solicitacoes.aceitaWhatsapp, true),
        notExists(
          tx
            .select({ id: notificacoes.id })
            .from(notificacoes)
            .where(
              and(
                eq(notificacoes.solicitacaoId, solicitacoes.id),
                eq(notificacoes.equipamentoId, equipamento.id),
                eq(notificacoes.evento, "equipamento_desativado"),
              ),
            ),
        ),
      ),
    );
  return enfileirarAvisos(tx, pedidos.map((p) => avisoEquipamentoDesativado(p, equipamento)));
}
