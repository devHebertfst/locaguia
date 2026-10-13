import { z } from "zod";
import { dataValida, hojeNaLocadora, somarDias } from "@/lib/datas";
import { normalizarCelular } from "@/lib/telefone";

export const LIMITES = {
  nome: { min: 2, max: 80 },
  servico: { min: 5, max: 1000 },
  equipamentos: 20,
  materiais: 30,
  tamanhoMaterial: 120,
  // até quantos dias à frente o início pode ser marcado
  antecedenciaMaximaDias: 365,
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const texto = (
  rotulo: string,
  vazio: string,
  { min, max }: { min: number; max: number },
) =>
  z
    .string()
    .transform((v) => v.trim().replace(/[ \t]+/g, " "))
    .pipe(
      z
        .string()
        .min(1, vazio)
        .min(min, `${rotulo} precisa ter pelo menos ${min} caracteres.`)
        .max(max, `${rotulo} pode ter no máximo ${max} caracteres.`),
    );

export function esquemaSolicitacao(hoje: string = hojeNaLocadora()) {
  const limiteInicio = somarDias(hoje, LIMITES.antecedenciaMaximaDias);

  return z
    .object({
      nome: texto("O nome", "Informe seu nome.", LIMITES.nome),
      telefone: z
        .string()
        .transform((v, ctx) => {
          const e164 = normalizarCelular(v);
          if (!e164) {
            ctx.addIssue({
              code: "custom",
              message: "Informe um celular com DDD, por exemplo (11) 91234-5678.",
            });
            return z.NEVER;
          }
          return e164;
        }),
      servico: texto("A descrição do serviço", "Descreva o serviço.", LIMITES.servico),
      dataInicio: z
        .string()
        .refine(dataValida, "Informe a data de início.")
        .refine((d) => d >= hoje, "A data de início não pode ser no passado.")
        .refine((d) => d <= limiteInicio, "A data de início pode ser no máximo daqui a 1 ano."),
      dataFim: z.string().refine(dataValida, "Informe a data de devolução."),
      equipamentos: z
        .array(z.string().regex(UUID, "Equipamento inválido."))
        .min(1, "Escolha pelo menos um equipamento.")
        .max(LIMITES.equipamentos, `Escolha no máximo ${LIMITES.equipamentos} equipamentos.`)
        .transform((ids) => [...new Set(ids)]),
      materiais: z
        .array(z.string().trim().min(1).max(LIMITES.tamanhoMaterial))
        .max(LIMITES.materiais)
        .default([]),
      aceitaWhatsapp: z.boolean(),
    })
    .refine((s) => s.dataFim >= s.dataInicio, {
      path: ["dataFim"],
      message: "A devolução não pode ser antes do início.",
    });
}

export type Solicitacao = z.output<ReturnType<typeof esquemaSolicitacao>>;
export type CampoSolicitacao = keyof Solicitacao;

// Lê o FormData do formulário de orçamento no formato que o esquema espera.
export function lerFormulario(formData: FormData) {
  const textoDe = (campo: string) => {
    const valor = formData.get(campo);
    return typeof valor === "string" ? valor : "";
  };
  return {
    nome: textoDe("nome"),
    telefone: textoDe("telefone"),
    servico: textoDe("servico"),
    dataInicio: textoDe("dataInicio"),
    dataFim: textoDe("dataFim"),
    equipamentos: formData.getAll("equipamentos").filter((v) => typeof v === "string"),
    materiais: formData.getAll("materiais").filter((v) => typeof v === "string"),
    aceitaWhatsapp: formData.get("aceitaWhatsapp") === "on",
  };
}

// Primeiro erro de cada campo, para mostrar ao lado do campo.
export function errosPorCampo(erro: z.ZodError): Partial<Record<CampoSolicitacao, string>> {
  const erros: Partial<Record<CampoSolicitacao, string>> = {};
  for (const issue of erro.issues) {
    const campo = issue.path[0] as CampoSolicitacao | undefined;
    if (campo && !erros[campo]) erros[campo] = issue.message;
  }
  return erros;
}
