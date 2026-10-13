import "server-only";
import { headers } from "next/headers";

// IP do cliente. Na Vercel, x-forwarded-for é definido pela própria plataforma.
export async function ipDoCliente(): Promise<string> {
  const h = await headers();
  const encaminhado = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return encaminhado || h.get("x-real-ip") || "desconhecido";
}
