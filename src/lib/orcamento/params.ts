import { LIMITES } from "./validacao";

type ValorParam = string | string[] | undefined;

export type PreenchimentoOrcamento = {
  equipamentos: string[];
  servico: string;
  materiais: string[];
};

function lista(valor: ValorParam): string[] {
  const valores = Array.isArray(valor) ? valor : valor ? [valor] : [];
  return valores.flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean);
}

// Campos pré-preenchidos via URL, vindos do catálogo ou do assistente:
// /orcamento?equipamentos=id1,id2&servico=...&materiais=cimento&materiais=areia
export function lerPreenchimento(params: Record<string, ValorParam>): PreenchimentoOrcamento {
  const servico = Array.isArray(params.servico) ? params.servico[0] : params.servico;
  return {
    equipamentos: [...new Set(lista(params.equipamentos))].slice(0, LIMITES.equipamentos),
    servico: (servico ?? "").slice(0, LIMITES.servico.max),
    materiais: (Array.isArray(params.materiais) ? params.materiais : params.materiais ? [params.materiais] : [])
      .map((m) => m.trim().slice(0, LIMITES.tamanhoMaterial))
      .filter(Boolean)
      .slice(0, LIMITES.materiais),
  };
}

export function hrefOrcamento(p: Partial<PreenchimentoOrcamento>): string {
  const params = new URLSearchParams();
  if (p.equipamentos?.length) params.set("equipamentos", p.equipamentos.join(","));
  if (p.servico) params.set("servico", p.servico);
  for (const m of p.materiais ?? []) params.append("materiais", m);
  const query = params.toString();
  return query ? `/orcamento?${query}` : "/orcamento";
}
