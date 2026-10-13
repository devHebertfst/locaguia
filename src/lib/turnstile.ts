import "server-only";
import { env } from "@/lib/env";

// Confere o token do Cloudflare Turnstile. Sem TURNSTILE_SECRET_KEY (em
// desenvolvimento), a verificação é pulada.
export async function verificarTurnstile(token: string, ip: string): Promise<boolean> {
  const segredo = env.TURNSTILE_SECRET_KEY;
  if (!segredo) return true;
  if (!token) return false;

  try {
    const resposta = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: segredo, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    });
    const resultado = (await resposta.json()) as { success?: boolean };
    return resultado.success === true;
  } catch (erro) {
    console.error("[turnstile] falha ao verificar", erro);
    return false;
  }
}
