import { z } from "zod";
import type { Papel } from "@/lib/auth/regras";

export const ROTULO_PAPEL: Record<Papel, string> = {
  admin: "Administrador",
  funcionario: "Funcionário",
};

export const DESCRICAO_PAPEL: Record<Papel, string> = {
  admin: "Tudo, inclusive cadastrar e bloquear pessoas da equipe.",
  funcionario: "Equipamentos, pedidos e sugestões.",
};

export const LIMITES_EQUIPE = { nome: { min: 2, max: 80 } } as const;

export const esquemaMembro = z.object({
  nome: z
    .string()
    .transform((v) => v.trim().replace(/\s+/g, " "))
    .pipe(
      z
        .string()
        .min(1, "Informe o nome.")
        .min(LIMITES_EQUIPE.nome.min, `O nome precisa ter pelo menos ${LIMITES_EQUIPE.nome.min} caracteres.`)
        .max(LIMITES_EQUIPE.nome.max, `O nome pode ter no máximo ${LIMITES_EQUIPE.nome.max} caracteres.`),
    ),
  // Guardado em minúsculas: o login compara o e-mail do Google sem diferenciar maiúsculas.
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.string().min(1, "Informe o e-mail.").pipe(z.email("Informe um e-mail válido, o mesmo da conta Google."))),
  papel: z.enum(["admin", "funcionario"], { error: "Escolha o papel." }),
});

export type DadosMembro = z.output<typeof esquemaMembro>;
export type CampoMembro = keyof DadosMembro;

export function lerFormularioMembro(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
    papel: String(formData.get("papel") ?? ""),
  };
}

export function errosMembro(erro: z.ZodError): Partial<Record<CampoMembro, string>> {
  const erros: Partial<Record<CampoMembro, string>> = {};
  for (const issue of erro.issues) {
    const campo = issue.path[0] as CampoMembro | undefined;
    if (campo && !erros[campo]) erros[campo] = issue.message;
  }
  return erros;
}

export type MudancaMembro = { papel: Papel } | { autorizado: boolean };

type Membro = { id: string; papel: Papel; autorizado: boolean };

// Diz por que a mudança não pode ser feita, ou null se pode. Evita que o
// admin se tranque para fora e que a loja fique sem nenhum admin ativo.
export function bloqueioDaMudanca(
  quemAltera: { id: string },
  alvo: Membro,
  mudanca: MudancaMembro,
  adminsAtivos: number,
): string | null {
  const proprio = quemAltera.id === alvo.id;
  const tiraAdmin =
    alvo.papel === "admin" &&
    alvo.autorizado &&
    (("papel" in mudanca && mudanca.papel !== "admin") || ("autorizado" in mudanca && !mudanca.autorizado));

  if (proprio && "autorizado" in mudanca && !mudanca.autorizado) return "Você não pode bloquear a sua própria conta.";
  if (proprio && tiraAdmin) return "Você não pode tirar o seu próprio acesso de administrador.";
  if (tiraAdmin && adminsAtivos <= 1) return "A loja precisa de pelo menos um administrador ativo.";
  return null;
}
