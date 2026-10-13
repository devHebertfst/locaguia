"use server";

import { gerarResposta } from "@/lib/assistente/gemini";
import { conversaLiberada, liberarConversa } from "@/lib/assistente/liberacao";
import {
  esquemaConversa,
  historicoParaModelo,
  instrucoesSistema,
  interpretarResposta,
  montarCatalogo,
  type MensagemChat,
  type RespostaAssistente,
} from "@/lib/assistente/nucleo";
import { respostaSimulada } from "@/lib/assistente/simulado";
import { listarParaAssistente } from "@/lib/catalogo/consultas";
import { env } from "@/lib/env";
import { consumirLimite } from "@/lib/limites";
import { ipDoCliente } from "@/lib/requisicao";
import { verificarTurnstile } from "@/lib/turnstile";

export type ResultadoAssistente =
  | { ok: true; resposta: RespostaAssistente }
  | {
      ok: false;
      erro: "verificacao" | "limite_conversa" | "limite_uso" | "indisponivel" | "invalido";
      mensagem: string;
    };

const FALHA: ResultadoAssistente = {
  ok: false,
  erro: "indisponivel",
  mensagem:
    "O assistente não conseguiu responder agora. Tente de novo em instantes ou procure o equipamento no catálogo.",
};

export async function perguntarAssistente(
  mensagens: MensagemChat[],
  tokenTurnstile: string,
): Promise<ResultadoAssistente> {
  const conversa = esquemaConversa(env.LIMITE_ASSISTENTE_MENSAGENS_CONVERSA).safeParse(mensagens);
  if (!conversa.success) {
    const fimDaConversa = conversa.error.issues.some((i) => i.message === "limite_conversa");
    return fimDaConversa
      ? {
          ok: false,
          erro: "limite_conversa",
          mensagem: "Esta conversa chegou ao limite de perguntas. Comece uma nova conversa para continuar.",
        }
      : { ok: false, erro: "invalido", mensagem: conversa.error.issues[0]?.message ?? "Mensagem inválida." };
  }

  const ip = await ipDoCliente();
  if (!(await conversaLiberada())) {
    if (!(await verificarTurnstile(tokenTurnstile, ip))) {
      return {
        ok: false,
        erro: "verificacao",
        mensagem: "Não conseguimos confirmar que você não é um robô. Tente de novo.",
      };
    }
    await liberarConversa();
  }

  try {
    const [porIp, diario] = await Promise.all([
      consumirLimite(`assistente:${ip}`, env.LIMITE_ASSISTENTE_POR_IP_HORA, "hora"),
      consumirLimite("assistente:global", env.LIMITE_ASSISTENTE_DIARIO, "dia"),
    ]);
    if (!porIp || !diario) {
      return {
        ok: false,
        erro: "limite_uso",
        mensagem: diario
          ? "Você fez muitas perguntas na última hora. Tente mais tarde ou procure no catálogo."
          : "O assistente atingiu o limite de uso de hoje. Procure o equipamento no catálogo ou peça um orçamento direto.",
      };
    }

    const { texto: catalogo, porCodigo } = montarCatalogo(await listarParaAssistente());
    const bruto = env.ASSISTENTE_SIMULADO === "1"
      ? respostaSimulada(conversa.data, porCodigo)
      : await gerarResposta(instrucoesSistema(catalogo), historicoParaModelo(conversa.data));

    const resposta = interpretarResposta(bruto, porCodigo);
    if (!resposta) {
      console.error("[assistente] resposta fora do formato:", bruto.slice(0, 500));
      return FALHA;
    }
    return { ok: true, resposta };
  } catch (erro) {
    console.error("[assistente] falha", erro);
    return FALHA;
  }
}
