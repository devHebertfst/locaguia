"use server";

import { after } from "next/server";
import { enviarEmailParaLoja } from "@/lib/email";
import { env } from "@/lib/env";
import { consumirLimite } from "@/lib/limites";
import {
  codigoSolicitacao,
  linkWhatsapp,
  textoSolicitacao,
} from "@/lib/orcamento/mensagem";
import { registrarSolicitacao } from "@/lib/orcamento/registrar";
import {
  errosPorCampo,
  esquemaSolicitacao,
  lerFormulario,
  type CampoSolicitacao,
} from "@/lib/orcamento/validacao";
import { ipDoCliente } from "@/lib/requisicao";
import { verificarTurnstile } from "@/lib/turnstile";

export type EstadoOrcamento =
  | { status: "inicial" }
  | {
      status: "erro";
      mensagem?: string;
      erros?: Partial<Record<CampoSolicitacao, string>>;
    }
  | { status: "ok"; codigo: string; linkWhatsapp?: string };

export async function enviarOrcamento(
  _anterior: EstadoOrcamento,
  formData: FormData,
): Promise<EstadoOrcamento> {
  const validacao = esquemaSolicitacao().safeParse(lerFormulario(formData));
  if (!validacao.success) {
    return {
      status: "erro",
      mensagem: "Confira os campos destacados.",
      erros: errosPorCampo(validacao.error),
    };
  }
  const dados = validacao.data;

  const ip = await ipDoCliente();
  const token = formData.get("cf-turnstile-response");
  if (!(await verificarTurnstile(typeof token === "string" ? token : "", ip))) {
    return {
      status: "erro",
      mensagem: "Não conseguimos confirmar que você não é um robô. Tente de novo.",
    };
  }

  try {
    if (!(await consumirLimite(`orcamento:${ip}`, env.LIMITE_FORMULARIOS_POR_IP_HORA, "hora"))) {
      return {
        status: "erro",
        mensagem:
          "Recebemos muitos pedidos deste aparelho na última hora. Tente mais tarde ou fale com a locadora pelo WhatsApp.",
      };
    }

    const registro = await registrarSolicitacao(dados);
    if (!registro.ok) {
      return {
        status: "erro",
        mensagem: `Estes equipamentos não estão mais disponíveis: ${registro.indisponiveis.join(", ")}. Remova-os e envie de novo.`,
        erros: { equipamentos: "Algum equipamento escolhido ficou indisponível." },
      };
    }

    const texto = textoSolicitacao({
      id: registro.id,
      nome: dados.nome,
      telefone: dados.telefone,
      servico: dados.servico,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
      equipamentos: registro.nomesEquipamentos,
      materiais: dados.materiais,
    });
    const codigo = codigoSolicitacao(registro.id);

    // O e-mail sai depois da resposta: não atrasa o cliente e uma falha só vai para o log.
    after(() =>
      enviarEmailParaLoja({ assunto: `Novo pedido de orçamento ${codigo} - ${dados.nome}`, texto }),
    );

    return {
      status: "ok",
      codigo,
      linkWhatsapp: env.WHATSAPP_LOJA ? linkWhatsapp(env.WHATSAPP_LOJA, texto) : undefined,
    };
  } catch (erro) {
    console.error("[orcamento] falha ao registrar", erro);
    return {
      status: "erro",
      mensagem: "Não conseguimos registrar seu pedido agora. Tente de novo em alguns minutos.",
    };
  }
}
