"use server";

import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { equipamentos, sugestoes } from "@/db/schema";
import { env } from "@/lib/env";
import { consumirLimite } from "@/lib/limites";
import { ipDoCliente } from "@/lib/requisicao";
import {
  errosSugestao,
  esquemaSugestao,
  lerFormularioSugestao,
  type CampoSugestao,
  type TipoSugestao,
} from "@/lib/sugestoes/validacao";
import { verificarTurnstile } from "@/lib/turnstile";

export type EstadoSugestao =
  | { status: "inicial" }
  | { status: "erro"; mensagem?: string; erros?: Partial<Record<CampoSugestao, string>> }
  | { status: "ok"; tipo: TipoSugestao; querAviso: boolean };

// Sugestão de equipamento novo ou pedido de "avise-me quando estiver
// disponível". Público: passa pelo Turnstile e pelo limite por IP.
export async function enviarSugestao(_anterior: EstadoSugestao, formData: FormData): Promise<EstadoSugestao> {
  const validacao = esquemaSugestao.safeParse(lerFormularioSugestao(formData));
  if (!validacao.success) {
    return { status: "erro", mensagem: "Confira os campos destacados.", erros: errosSugestao(validacao.error) };
  }
  const dados = validacao.data;

  const ip = await ipDoCliente();
  const token = formData.get("cf-turnstile-response");
  if (!(await verificarTurnstile(typeof token === "string" ? token : "", ip))) {
    return { status: "erro", mensagem: "Não conseguimos confirmar que você não é um robô. Tente de novo." };
  }

  try {
    if (!(await consumirLimite(`sugestao:${ip}`, env.LIMITE_FORMULARIOS_POR_IP_HORA, "hora"))) {
      return {
        status: "erro",
        mensagem: "Recebemos muitos envios deste aparelho na última hora. Tente mais tarde ou fale com a locadora pelo WhatsApp.",
      };
    }

    const db = getDb();
    if (dados.tipo === "novo_equipamento") {
      await db.insert(sugestoes).values({
        tipo: "novo_equipamento",
        nomeEquipamento: dados.nomeEquipamento,
        motivo: dados.motivo,
        nomeCliente: dados.nome,
        telefone: dados.telefone,
        querAviso: dados.querAviso,
      });
      return { status: "ok", tipo: dados.tipo, querAviso: dados.querAviso };
    }

    // O nome do equipamento vem do banco, nunca do formulário.
    const [equipamento] = await db
      .select({ nome: equipamentos.nome, disponivel: equipamentos.disponivel })
      .from(equipamentos)
      .where(and(eq(equipamentos.id, dados.equipamentoId), eq(equipamentos.ativo, true)));
    if (!equipamento) return { status: "erro", mensagem: "Este equipamento não está mais no catálogo." };
    if (equipamento.disponivel) {
      return { status: "erro", mensagem: "Este equipamento já está disponível. Recarregue a página para pedir um orçamento." };
    }

    // Mesmo telefone pedindo o mesmo equipamento de novo: atualiza o pedido
    // que já existe em vez de criar outro (e de mandar dois avisos depois).
    const atualizadas = await db
      .update(sugestoes)
      .set({
        nomeCliente: dados.nome,
        motivo: dados.motivo,
        // quem já pediu aviso continua pedindo
        querAviso: sql`${sugestoes.querAviso} or ${dados.querAviso}`,
      })
      .where(
        and(
          eq(sugestoes.tipo, "aguardar_disponibilidade"),
          eq(sugestoes.status, "pendente"),
          eq(sugestoes.equipamentoId, dados.equipamentoId),
          eq(sugestoes.telefone, dados.telefone),
        ),
      )
      .returning({ querAviso: sugestoes.querAviso });
    if (atualizadas.length === 0) {
      await db.insert(sugestoes).values({
        tipo: "aguardar_disponibilidade",
        equipamentoId: dados.equipamentoId,
        nomeEquipamento: equipamento.nome,
        motivo: dados.motivo,
        nomeCliente: dados.nome,
        telefone: dados.telefone,
        querAviso: dados.querAviso,
      });
    }
    return { status: "ok", tipo: dados.tipo, querAviso: atualizadas[0]?.querAviso ?? dados.querAviso };
  } catch (erro) {
    console.error("[sugestao] falha ao registrar", erro);
    return { status: "erro", mensagem: "Não conseguimos registrar agora. Tente de novo em alguns minutos." };
  }
}
