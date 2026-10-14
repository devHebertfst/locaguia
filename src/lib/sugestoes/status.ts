import type { TipoSugestao } from "./validacao";

export const STATUS_SUGESTAO = ["pendente", "atendida", "descartada"] as const;
export type StatusSugestao = (typeof STATUS_SUGESTAO)[number];

// "pendente" é o padrão: é o que a equipe ainda precisa olhar.
export const FILTROS_SUGESTAO = [...STATUS_SUGESTAO, "todas"] as const;
export type FiltroSugestao = (typeof FILTROS_SUGESTAO)[number];

export const ROTULO_FILTRO_SUGESTAO: Record<FiltroSugestao, string> = {
  pendente: "Pendentes",
  atendida: "Atendidas",
  descartada: "Descartadas",
  todas: "Todas",
};

export const ROTULO_TIPO_SUGESTAO: Record<TipoSugestao, string> = {
  novo_equipamento: "Equipamento que a loja não tem",
  aguardar_disponibilidade: "Esperando ficar disponível",
};

export function lerFiltroSugestao(valor: unknown): FiltroSugestao {
  return FILTROS_SUGESTAO.includes(valor as FiltroSugestao) ? (valor as FiltroSugestao) : "pendente";
}

export function statusDoFiltroSugestao(filtro: FiltroSugestao): StatusSugestao[] {
  return filtro === "todas" ? [...STATUS_SUGESTAO] : [filtro];
}

// Primeira mensagem da loja para quem sugeriu, aberta no WhatsApp pelo painel.
export function mensagemSobreSugestao(s: { nomeCliente: string; nomeEquipamento: string }): string {
  const primeiroNome = s.nomeCliente.trim().split(/\s+/)[0];
  return `Olá, ${primeiroNome}! Aqui é da locadora, sobre o equipamento que você procurou no site: ${s.nomeEquipamento}.`;
}
