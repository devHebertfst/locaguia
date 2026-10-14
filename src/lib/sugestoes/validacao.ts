import { z } from "zod";
import { normalizarCelular } from "@/lib/telefone";

export const LIMITES_SUGESTAO = {
  nome: { min: 2, max: 80 },
  equipamento: { min: 2, max: 120 },
  motivo: { max: 500 },
} as const;

export type TipoSugestao = "novo_equipamento" | "aguardar_disponibilidade";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const umaLinha = (v: string) => v.trim().replace(/\s+/g, " ");

const nome = z
  .string()
  .transform(umaLinha)
  .pipe(
    z
      .string()
      .min(1, "Informe seu nome.")
      .min(LIMITES_SUGESTAO.nome.min, `O nome precisa ter pelo menos ${LIMITES_SUGESTAO.nome.min} caracteres.`)
      .max(LIMITES_SUGESTAO.nome.max, `O nome pode ter no máximo ${LIMITES_SUGESTAO.nome.max} caracteres.`),
  );

const telefone = z.string().transform((v, ctx) => {
  const e164 = normalizarCelular(v);
  if (!e164) {
    ctx.addIssue({ code: "custom", message: "Informe um celular com DDD, por exemplo (11) 91234-5678." });
    return z.NEVER;
  }
  return e164;
});

const motivo = z
  .string()
  .transform((v) => v.trim().replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n"))
  .pipe(z.string().max(LIMITES_SUGESTAO.motivo.max, `Use no máximo ${LIMITES_SUGESTAO.motivo.max} caracteres.`));

// Equipamento que a loja não tem: o cliente diz qual e para quê.
const novoEquipamento = z.object({
  tipo: z.literal("novo_equipamento"),
  nomeEquipamento: z
    .string()
    .transform(umaLinha)
    .pipe(
      z
        .string()
        .min(1, "Diga qual equipamento você procura.")
        .min(LIMITES_SUGESTAO.equipamento.min, "Descreva o equipamento com pelo menos 2 caracteres.")
        .max(LIMITES_SUGESTAO.equipamento.max, `Use no máximo ${LIMITES_SUGESTAO.equipamento.max} caracteres.`),
    ),
  motivo,
  nome,
  telefone,
  querAviso: z.boolean(),
});

// Equipamento do catálogo que está indisponível: o nome vem do banco, não do cliente.
const aguardar = z.object({
  tipo: z.literal("aguardar_disponibilidade"),
  equipamentoId: z.string().regex(UUID, "Equipamento inválido."),
  motivo,
  nome,
  telefone,
  querAviso: z.boolean(),
});

export const esquemaSugestao = z.discriminatedUnion("tipo", [novoEquipamento, aguardar]);

export type Sugestao = z.output<typeof esquemaSugestao>;
export type CampoSugestao = "nomeEquipamento" | "equipamentoId" | "motivo" | "nome" | "telefone";

export function lerFormularioSugestao(formData: FormData) {
  const texto = (campo: string) => {
    const valor = formData.get(campo);
    return typeof valor === "string" ? valor : "";
  };
  return {
    tipo: texto("tipo"),
    nomeEquipamento: texto("nomeEquipamento"),
    equipamentoId: texto("equipamentoId"),
    motivo: texto("motivo"),
    nome: texto("nome"),
    telefone: texto("telefone"),
    querAviso: formData.get("querAviso") === "on",
  };
}

export function errosSugestao(erro: z.ZodError): Partial<Record<CampoSugestao, string>> {
  const erros: Partial<Record<CampoSugestao, string>> = {};
  for (const issue of erro.issues) {
    const campo = issue.path[0] as CampoSugestao | undefined;
    if (campo && !erros[campo]) erros[campo] = issue.message;
  }
  return erros;
}

// Pré-preenchimento de /sugerir, vindo do assistente:
// /sugerir?equipamento=Rompedor%2030%20kg&servico=Quebrar%20laje
export function hrefSugerir(p: { equipamento?: string; servico?: string } = {}): string {
  const params = new URLSearchParams();
  if (p.equipamento) params.set("equipamento", p.equipamento);
  if (p.servico) params.set("servico", p.servico);
  const query = params.toString();
  return query ? `/sugerir?${query}` : "/sugerir";
}

type ValorParam = string | string[] | undefined;

export function lerPreenchimentoSugestao(params: Record<string, ValorParam>) {
  const primeiro = (v: ValorParam) => (Array.isArray(v) ? v[0] : v) ?? "";
  return {
    nomeEquipamento: primeiro(params.equipamento).slice(0, LIMITES_SUGESTAO.equipamento.max),
    motivo: primeiro(params.servico).slice(0, LIMITES_SUGESTAO.motivo.max),
  };
}
