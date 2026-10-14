"use server";

import { and, count, eq, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { getDb } from "@/db";
import { usuarios } from "@/db/schema";
import { exigirUsuario } from "@/lib/auth/sessao";
import { UUID } from "@/lib/equipamentos/validacao";
import {
  bloqueioDaMudanca,
  errosMembro,
  esquemaMembro,
  lerFormularioMembro,
  type CampoMembro,
  type MudancaMembro,
} from "@/lib/equipe/regras";

// Só o admin gerencia a equipe. Toda ação confere o papel no banco.

export type EstadoEquipe =
  | { status: "inicial" }
  | { status: "erro"; mensagem?: string; erros?: Partial<Record<CampoMembro, string>> }
  | { status: "ok"; mensagem: string };

// Cadastra o e-mail. A conta Google com esse e-mail é ligada ao cadastro no
// primeiro login (vincularConta).
export async function adicionarMembro(_anterior: EstadoEquipe, formData: FormData): Promise<EstadoEquipe> {
  await exigirUsuario(["admin"]);
  const validacao = esquemaMembro.safeParse(lerFormularioMembro(formData));
  if (!validacao.success) {
    return { status: "erro", mensagem: "Confira os campos destacados.", erros: errosMembro(validacao.error) };
  }
  const { nome, email, papel } = validacao.data;

  const db = getDb();
  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(sql`lower(${usuarios.email}) = ${email}`)
    .limit(1);
  if (existente) {
    return { status: "erro", erros: { email: "Este e-mail já está na equipe. Para liberar o acesso de novo, use a lista abaixo." } };
  }

  await db.insert(usuarios).values({ nome, email, papel, autorizado: true });
  refresh();
  return { status: "ok", mensagem: `${nome} pode entrar com a conta Google ${email}.` };
}

export type ResultadoMudanca = { ok: true } | { ok: false; mensagem: string };

// Troca o papel ou bloqueia/libera o acesso. Bloquear vale na hora: toda
// página e ação confere `autorizado` no banco. Ninguém é apagado.
export async function alterarMembro(id: string, pedido: MudancaMembro): Promise<ResultadoMudanca> {
  const eu = await exigirUsuario(["admin"]);
  // Monta a mudança de novo: o argumento vem do navegador e pode trazer outros campos.
  const mudanca = lerMudanca(pedido);
  if (typeof id !== "string" || !UUID.test(id) || !mudanca) return { ok: false, mensagem: "Mudança inválida." };

  const resultado = await getDb().transaction(async (tx): Promise<ResultadoMudanca> => {
    // Trava os admins ativos: duas mudanças ao mesmo tempo não deixam a loja sem admin.
    await tx
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(and(eq(usuarios.papel, "admin"), eq(usuarios.autorizado, true)))
      .for("update");
    const [alvo] = await tx
      .select({ id: usuarios.id, papel: usuarios.papel, autorizado: usuarios.autorizado })
      .from(usuarios)
      .where(eq(usuarios.id, id))
      .for("update");
    if (!alvo) return { ok: false, mensagem: "Esta pessoa não está mais na equipe." };

    const [{ adminsAtivos }] = await tx
      .select({ adminsAtivos: count() })
      .from(usuarios)
      .where(and(eq(usuarios.papel, "admin"), eq(usuarios.autorizado, true)));
    const bloqueio = bloqueioDaMudanca(eu, alvo, mudanca, adminsAtivos);
    if (bloqueio) return { ok: false, mensagem: bloqueio };

    await tx.update(usuarios).set(mudanca).where(eq(usuarios.id, id));
    return { ok: true };
  });
  if (resultado.ok) refresh();
  return resultado;
}

function lerMudanca(pedido: unknown): MudancaMembro | null {
  if (typeof pedido !== "object" || pedido === null) return null;
  const { papel, autorizado } = pedido as Record<string, unknown>;
  if (papel === "admin" || papel === "funcionario") return { papel };
  if (typeof autorizado === "boolean") return { autorizado };
  return null;
}
