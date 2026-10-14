"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { getDb } from "@/db";
import { solicitacoes } from "@/db/schema";
import { exigirUsuario } from "@/lib/auth/sessao";
import { UUID } from "@/lib/equipamentos/validacao";
import { statusValido } from "@/lib/pedidos/status";

// Muda o andamento de um pedido. Admin e funcionário podem.
export async function alterarStatusPedido(formData: FormData) {
  await exigirUsuario();
  const id = String(formData.get("id") ?? "");
  const status = formData.get("status");
  if (!UUID.test(id) || !statusValido(status)) return;
  await getDb().update(solicitacoes).set({ status }).where(eq(solicitacoes.id, id));
  refresh();
}
