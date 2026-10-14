import "server-only";
import { env } from "@/lib/env";
import { corpoTemplate, interpretarErroCloud, type ResultadoEnvio } from "./templates";

const VERSAO_API = "v23.0";

export function avisosConfigurados(): boolean {
  return Boolean(env.WHATSAPP_CLOUD_TOKEN && env.WHATSAPP_CLOUD_PHONE_NUMBER_ID);
}

// Envia um template pela WhatsApp Cloud API. Nunca lança: o resultado diz se
// vale tentar de novo.
export async function enviarTemplate(telefone: string, template: string, parametros: string[]): Promise<ResultadoEnvio> {
  const { WHATSAPP_CLOUD_TOKEN: token, WHATSAPP_CLOUD_PHONE_NUMBER_ID: numero } = env;
  if (!token || !numero) return { ok: false, erro: "WhatsApp Cloud API não configurada", definitivo: false };

  try {
    const resposta = await fetch(`https://graph.facebook.com/${VERSAO_API}/${numero}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(corpoTemplate(telefone, template, parametros, env.WHATSAPP_TEMPLATE_IDIOMA)),
      signal: AbortSignal.timeout(10_000),
    });
    if (resposta.ok) return { ok: true };
    const corpo = await resposta.json().catch(() => null);
    return interpretarErroCloud(resposta.status, corpo);
  } catch (erro) {
    return { ok: false, erro: `falha de rede: ${String(erro)}`.slice(0, 500), definitivo: false };
  }
}
