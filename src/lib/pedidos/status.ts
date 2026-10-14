import { FUSO_LOCADORA, formatarData } from "@/lib/datas";
import { codigoSolicitacao } from "@/lib/orcamento/mensagem";

export const STATUS_PEDIDO = ["nova", "em_atendimento", "fechada", "perdida"] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number];

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  nova: "Novo",
  em_atendimento: "Em atendimento",
  fechada: "Fechado",
  perdida: "Perdido",
};

// Filtros da lista. "abertos" (novos + em atendimento) é o padrão: é o que a
// equipe precisa responder.
export const FILTROS_PEDIDO = ["abertos", ...STATUS_PEDIDO, "todos"] as const;
export type FiltroPedido = (typeof FILTROS_PEDIDO)[number];

export const ROTULO_FILTRO: Record<FiltroPedido, string> = {
  abertos: "Abertos",
  nova: "Novos",
  em_atendimento: "Em atendimento",
  fechada: "Fechados",
  perdida: "Perdidos",
  todos: "Todos",
};

export function lerFiltroPedido(valor: unknown): FiltroPedido {
  return FILTROS_PEDIDO.includes(valor as FiltroPedido) ? (valor as FiltroPedido) : "abertos";
}

export function statusDoFiltro(filtro: FiltroPedido): StatusPedido[] {
  if (filtro === "abertos") return ["nova", "em_atendimento"];
  if (filtro === "todos") return [...STATUS_PEDIDO];
  return [filtro];
}

export function statusValido(valor: unknown): valor is StatusPedido {
  return STATUS_PEDIDO.includes(valor as StatusPedido);
}

export type AcaoPedido = { para: StatusPedido; rotulo: string; principal?: boolean };

// O que a equipe pode fazer a partir de cada status. Fechado e perdido podem
// ser reabertos, para corrigir um clique errado.
export function acoesDoStatus(status: StatusPedido): AcaoPedido[] {
  switch (status) {
    case "nova":
      return [
        { para: "em_atendimento", rotulo: "Começar atendimento", principal: true },
        { para: "perdida", rotulo: "Marcar como perdido" },
      ];
    case "em_atendimento":
      return [
        { para: "fechada", rotulo: "Fechou negócio", principal: true },
        { para: "perdida", rotulo: "Marcar como perdido" },
      ];
    case "fechada":
    case "perdida":
      return [{ para: "em_atendimento", rotulo: "Reabrir atendimento" }];
  }
}

// Primeira mensagem da loja para o cliente, aberta no WhatsApp pelo painel.
export function mensagemParaCliente(pedido: { id: string; nome: string; dataInicio: string; dataFim: string }): string {
  const primeiroNome = pedido.nome.trim().split(/\s+/)[0];
  return [
    `Olá, ${primeiroNome}! Aqui é da locadora, sobre o seu pedido de orçamento ${codigoSolicitacao(pedido.id)}`,
    `para ${formatarData(pedido.dataInicio)} a ${formatarData(pedido.dataFim)}.`,
  ].join(" ");
}

// Link wa.me para o celular do cliente (E.164: +55DD9XXXXXXXX).
export function linkWhatsappCliente(telefone: string, texto: string): string {
  return `https://wa.me/${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
}

// Quando o pedido chegou, no fuso da loja: "hoje, 14:32", "ontem, 09:05" ou "12/10/2026, 18:40".
export function formatarRecebido(quando: Date, agora: Date = new Date()): string {
  const dia = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: FUSO_LOCADORA, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const hora = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO_LOCADORA, hour: "2-digit", minute: "2-digit" }).format(quando);
  const ontem = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
  if (dia(quando) === dia(agora)) return `hoje, ${hora}`;
  if (dia(quando) === dia(ontem)) return `ontem, ${hora}`;
  return `${formatarData(dia(quando))}, ${hora}`;
}

// Quantas diárias o período cobre, contando o dia da retirada e o da devolução.
export function diasDoPeriodo(dataInicio: string, dataFim: string): number {
  const ms = Date.parse(`${dataFim}T12:00:00Z`) - Date.parse(`${dataInicio}T12:00:00Z`);
  return Math.round(ms / 86_400_000) + 1;
}
