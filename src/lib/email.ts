import "server-only";
import { env } from "@/lib/env";

type Email = {
  assunto: string;
  texto: string;
};

// Envia um e-mail para a locadora pelo Resend. Retorna false (sem lançar) se
// não estiver configurado ou se o envio falhar: e-mail nunca bloqueia pedido.
export async function enviarEmailParaLoja({ assunto, texto }: Email): Promise<boolean> {
  const { RESEND_API_KEY: chave, EMAIL_REMETENTE: de, EMAIL_DESTINO: para } = env;
  if (!chave || !de || !para) return false;

  try {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: de,
        to: para.split(",").map((e) => e.trim()),
        subject: assunto,
        text: texto,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!resposta.ok) {
      console.error("[email] Resend respondeu", resposta.status, await resposta.text());
      return false;
    }
    return true;
  } catch (erro) {
    console.error("[email] falha ao enviar", erro);
    return false;
  }
}
