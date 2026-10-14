import { processarPendentes } from "@/lib/avisos/fila";
import { cronAutorizado } from "@/lib/avisos/cron";
import { env } from "@/lib/env";

// Vercel Cron (vercel.json): tenta de novo os avisos de WhatsApp que ficaram
// pendentes (Cloud API fora do ar, credenciais configuradas depois...).
export async function GET(request: Request) {
  if (!cronAutorizado(request.headers.get("authorization"), env.CRON_SECRET)) {
    return new Response("Não autorizado", { status: 401 });
  }
  const resumo = await processarPendentes(200);
  return Response.json(resumo);
}
