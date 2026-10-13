import { formatarData } from "@/lib/datas";
import { formatarCelular } from "@/lib/telefone";

export type ResumoSolicitacao = {
  id: string;
  nome: string;
  telefone: string; // E.164
  servico: string;
  dataInicio: string;
  dataFim: string;
  equipamentos: string[]; // nomes
  materiais: string[];
};

// Código curto para o cliente e a loja se referirem ao pedido.
export function codigoSolicitacao(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

// Texto que o cliente envia para o WhatsApp da loja e que também vai no e-mail.
export function textoSolicitacao(s: ResumoSolicitacao): string {
  const linhas = [
    `Olá! Quero um orçamento de locação (pedido ${codigoSolicitacao(s.id)}).`,
    "",
    `*Nome:* ${s.nome}`,
    `*WhatsApp:* ${formatarCelular(s.telefone)}`,
    `*Período:* ${formatarData(s.dataInicio)} a ${formatarData(s.dataFim)}`,
    "",
    "*Equipamentos:*",
    ...s.equipamentos.map((nome) => `- ${nome}`),
    "",
    "*Serviço:*",
    s.servico,
  ];
  if (s.materiais.length > 0) {
    linhas.push("", "*Materiais sugeridos pelo assistente:*", ...s.materiais.map((m) => `- ${m}`));
  }
  return linhas.join("\n");
}

// Link wa.me com a mensagem pronta. `numeroLoja`: só dígitos, com DDI (5511912345678).
export function linkWhatsapp(numeroLoja: string, texto: string): string {
  const numero = numeroLoja.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
