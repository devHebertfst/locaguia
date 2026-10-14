import "server-only";
import { asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { usuarios } from "@/db/schema";
import type { Papel } from "@/lib/auth/regras";

export type Membro = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  autorizado: boolean;
  // false: o e-mail foi cadastrado, mas a pessoa ainda não entrou com o Google
  jaEntrou: boolean;
  criadoEm: Date;
};

// Toda página que usa esta função chama exigirUsuario(["admin"]) antes.
export async function listarEquipe(): Promise<Membro[]> {
  const linhas = await getDb()
    .select({
      id: usuarios.id,
      nome: usuarios.nome,
      email: usuarios.email,
      papel: usuarios.papel,
      autorizado: usuarios.autorizado,
      authUserId: usuarios.authUserId,
      criadoEm: usuarios.criadoEm,
    })
    .from(usuarios)
    .orderBy(desc(usuarios.autorizado), asc(usuarios.nome));
  return linhas.map(({ authUserId, ...m }) => ({ ...m, jaEntrou: authUserId !== null }));
}
