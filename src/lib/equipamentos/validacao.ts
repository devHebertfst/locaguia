import { z } from "zod";

export const LIMITES_EQUIPAMENTO = {
  nome: { min: 2, max: 120 },
  categoria: { min: 2, max: 60 },
  descricao: { max: 2000 },
  fotos: 8,
  // lado maior da foto depois de reduzida no navegador
  ladoFoto: 1600,
} as const;

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const umaLinha = (v: string) => v.trim().replace(/\s+/g, " ");

export const esquemaEquipamento = z.object({
  nome: z
    .string()
    .transform(umaLinha)
    .pipe(
      z
        .string()
        .min(1, "Informe o nome do equipamento.")
        .min(LIMITES_EQUIPAMENTO.nome.min, `O nome precisa ter pelo menos ${LIMITES_EQUIPAMENTO.nome.min} caracteres.`)
        .max(LIMITES_EQUIPAMENTO.nome.max, `O nome pode ter no máximo ${LIMITES_EQUIPAMENTO.nome.max} caracteres.`),
    ),
  categoria: z
    .string()
    .transform(umaLinha)
    // "concretagem" e "Concretagem" viram a mesma categoria no filtro do catálogo
    .transform((v) => v.charAt(0).toLocaleUpperCase("pt-BR") + v.slice(1))
    .pipe(
      z
        .string()
        .min(1, "Informe a categoria.")
        .min(LIMITES_EQUIPAMENTO.categoria.min, "A categoria precisa ter pelo menos 2 caracteres.")
        .max(LIMITES_EQUIPAMENTO.categoria.max, `A categoria pode ter no máximo ${LIMITES_EQUIPAMENTO.categoria.max} caracteres.`),
    ),
  descricao: z
    .string()
    .transform((v) => v.trim().replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n"))
    .pipe(
      z
        .string()
        .max(LIMITES_EQUIPAMENTO.descricao.max, `A descrição pode ter no máximo ${LIMITES_EQUIPAMENTO.descricao.max} caracteres.`),
    ),
  disponivel: z.boolean(),
});

export type DadosEquipamento = z.infer<typeof esquemaEquipamento>;
export type CampoEquipamento = keyof DadosEquipamento;

export function lerFormularioEquipamento(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? ""),
    categoria: String(formData.get("categoria") ?? ""),
    descricao: String(formData.get("descricao") ?? ""),
    disponivel: formData.get("disponivel") === "on",
  };
}

export function errosEquipamento(erro: z.ZodError): Partial<Record<CampoEquipamento, string>> {
  const erros: Partial<Record<CampoEquipamento, string>> = {};
  for (const issue of erro.issues) {
    const campo = issue.path[0] as CampoEquipamento;
    erros[campo] ??= issue.message;
  }
  return erros;
}

// Caminho da foto no Storage: "<id do equipamento>/<uuid>.webp" (ou .jpg). O servidor
// só registra caminhos nesse formato e da pasta do próprio equipamento.
export function caminhoFotoValido(equipamentoId: string, caminho: string): boolean {
  const [pasta, arquivo, ...resto] = caminho.split("/");
  return (
    resto.length === 0 &&
    pasta === equipamentoId &&
    UUID.test(pasta) &&
    /^[0-9a-f-]{36}\.(webp|jpg)$/i.test(arquivo ?? "") &&
    UUID.test((arquivo ?? "").slice(0, 36))
  );
}
