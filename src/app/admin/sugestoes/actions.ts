"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { after } from "next/server";
import { getDb } from "@/db";
import { equipamentos, sugestoes } from "@/db/schema";
import { exigirUsuario } from "@/lib/auth/sessao";
import { enfileirarAvisos, processarPendentes } from "@/lib/avisos/fila";
import { avisoEquipamentoChegou } from "@/lib/avisos/templates";
import { UUID } from "@/lib/equipamentos/validacao";

// Admin e funcionário podem cuidar das sugestões.

// Liga a sugestão de equipamento novo ao equipamento que a loja cadastrou.
// Só aceita equipamento ativo e disponível: o aviso diz que dá para alugar.
// Quem pediu aviso recebe "equipamento chegou". Não há ligação automática
// por nome: é sempre a equipe que liga.
export async function atenderSugestao(formData: FormData) {
  await exigirUsuario();
  const id = String(formData.get("id") ?? "");
  const equipamentoId = String(formData.get("equipamentoId") ?? "");
  if (!UUID.test(id) || !UUID.test(equipamentoId)) return;

  const avisos = await getDb().transaction(async (tx) => {
    const [equipamento] = await tx
      .select({ id: equipamentos.id, nome: equipamentos.nome })
      .from(equipamentos)
      .where(and(eq(equipamentos.id, equipamentoId), eq(equipamentos.ativo, true), eq(equipamentos.disponivel, true)));
    if (!equipamento) return 0;

    const [sugestao] = await tx
      .update(sugestoes)
      .set({ status: "atendida", equipamentoAtendidoId: equipamento.id })
      .where(and(eq(sugestoes.id, id), eq(sugestoes.tipo, "novo_equipamento"), eq(sugestoes.status, "pendente")))
      .returning({ id: sugestoes.id, nomeCliente: sugestoes.nomeCliente, telefone: sugestoes.telefone, querAviso: sugestoes.querAviso });
    if (!sugestao?.querAviso) return 0;
    return enfileirarAvisos(tx, [avisoEquipamentoChegou(sugestao, equipamento)]);
  });
  if (avisos > 0) after(() => processarPendentes());
  refresh();
}

// Descartar tira da lista de pendentes sem avisar ninguém. Reabrir desfaz.
export async function alterarStatusSugestao(formData: FormData) {
  await exigirUsuario();
  const id = String(formData.get("id") ?? "");
  const para = formData.get("para");
  if (!UUID.test(id) || (para !== "descartada" && para !== "pendente")) return;
  const de = para === "descartada" ? "pendente" : "descartada";
  await getDb()
    .update(sugestoes)
    .set({ status: para })
    .where(and(eq(sugestoes.id, id), eq(sugestoes.status, de)));
  refresh();
}
