import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

// Depois que o cliente passa pelo Turnstile na primeira mensagem, um cookie
// assinado libera o resto da conversa por 1 hora, sem novo desafio a cada
// mensagem. Sem TURNSTILE_SECRET_KEY, tudo fica liberado.

const COOKIE = "assistente_liberado";
const DURACAO_SEGUNDOS = 60 * 60;

function assinar(expira: number, segredo: string): string {
  return createHmac("sha256", segredo).update(`assistente:${expira}`).digest("base64url");
}

export function tokenValido(valor: string | undefined, segredo: string, agora = Date.now()): boolean {
  if (!valor) return false;
  const [expiraTexto, assinatura] = valor.split(".");
  const expira = Number(expiraTexto);
  if (!Number.isFinite(expira) || expira * 1000 < agora || !assinatura) return false;
  const esperado = Buffer.from(assinar(expira, segredo));
  const recebido = Buffer.from(assinatura);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export function criarToken(segredo: string, agora = Date.now()): string {
  const expira = Math.floor(agora / 1000) + DURACAO_SEGUNDOS;
  return `${expira}.${assinar(expira, segredo)}`;
}

export async function conversaLiberada(): Promise<boolean> {
  const segredo = env.TURNSTILE_SECRET_KEY;
  if (!segredo) return true;
  return tokenValido((await cookies()).get(COOKIE)?.value, segredo);
}

export async function liberarConversa(): Promise<void> {
  const segredo = env.TURNSTILE_SECRET_KEY;
  if (!segredo) return;
  (await cookies()).set(COOKIE, criarToken(segredo), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DURACAO_SEGUNDOS,
    path: "/",
  });
}
