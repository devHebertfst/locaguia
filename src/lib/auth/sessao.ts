import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { usuarios } from "@/db/schema";
import { criarClienteSupabase } from "@/lib/supabase/servidor";
import { podeVincular, temPapel, type Papel } from "./regras";

export type UsuarioLogado = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
};

// Funcionário da sessão atual, ou null. Uma consulta por pedido (React cache).
export const usuarioAtual = cache(async (): Promise<UsuarioLogado | null> => {
  const supabase = await criarClienteSupabase();
  const { data } = await supabase.auth.getClaims();
  const authUserId = data?.claims.sub;
  if (!authUserId) return null;

  const [usuario] = await getDb()
    .select({
      id: usuarios.id,
      nome: usuarios.nome,
      email: usuarios.email,
      papel: usuarios.papel,
    })
    .from(usuarios)
    .where(and(eq(usuarios.authUserId, authUserId), eq(usuarios.autorizado, true)))
    .limit(1);
  return usuario ?? null;
});

// Chame no começo de toda página, Server Action e Route Handler da área da
// equipe. O proxy só faz uma checagem otimista.
export async function exigirUsuario(papeis?: readonly Papel[]): Promise<UsuarioLogado> {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/entrar");
  if (!temPapel(usuario.papel, papeis)) redirect("/admin");
  return usuario;
}

// Liga a conta do Supabase Auth ao cadastro feito pelo admin (pelo e-mail).
// Devolve false se o e-mail não tem acesso.
export async function vincularConta(authUserId: string, email: string): Promise<boolean> {
  const db = getDb();
  const [cadastro] = await db
    .select({
      id: usuarios.id,
      authUserId: usuarios.authUserId,
      autorizado: usuarios.autorizado,
    })
    .from(usuarios)
    .where(sql`lower(${usuarios.email}) = ${email.toLowerCase()}`)
    .limit(1);

  if (!cadastro || !podeVincular(cadastro, authUserId)) return false;
  if (cadastro.authUserId === null) {
    await db.update(usuarios).set({ authUserId }).where(eq(usuarios.id, cadastro.id));
  }
  return true;
}
