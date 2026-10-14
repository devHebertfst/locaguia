import { codigoSolicitacao } from "@/lib/orcamento/mensagem";

// Avisos automáticos ao cliente pela WhatsApp Cloud API. Mensagens que a loja
// inicia só podem usar templates aprovados pela Meta: cada evento usa um
// template com o MESMO nome e os parâmetros nesta ordem ({{1}}, {{2}}...).
//
// equipamento_chegou      {{1}} primeiro nome, {{2}} equipamento
//   "Olá, {{1}}! A locadora agora tem {{2}}, o equipamento que você sugeriu. Responda esta mensagem para pedir um orçamento."
// equipamento_disponivel  {{1}} primeiro nome, {{2}} equipamento
//   "Olá, {{1}}! {{2}} está disponível de novo na locadora. Responda esta mensagem para pedir um orçamento."
// equipamento_desativado  {{1}} primeiro nome, {{2}} equipamento, {{3}} código do pedido
//   "Olá, {{1}}. {{2}}, do seu pedido de orçamento {{3}}, saiu do catálogo da locadora. Responda esta mensagem para combinar uma alternativa."

export type EventoAviso = "equipamento_chegou" | "equipamento_disponivel" | "equipamento_desativado";

export const MAX_TENTATIVAS_AVISO = 5;

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}

export type NovoAviso = {
  telefone: string;
  evento: EventoAviso;
  template: string;
  parametros: string[];
  equipamentoId: string;
  sugestaoId?: string;
  solicitacaoId?: string;
};

export function avisoEquipamentoChegou(s: { id: string; nomeCliente: string; telefone: string }, equipamento: { id: string; nome: string }): NovoAviso {
  return {
    telefone: s.telefone,
    evento: "equipamento_chegou",
    template: "equipamento_chegou",
    parametros: [primeiroNome(s.nomeCliente), equipamento.nome],
    equipamentoId: equipamento.id,
    sugestaoId: s.id,
  };
}

export function avisoEquipamentoDisponivel(s: { id: string; nomeCliente: string; telefone: string }, equipamento: { id: string; nome: string }): NovoAviso {
  return {
    telefone: s.telefone,
    evento: "equipamento_disponivel",
    template: "equipamento_disponivel",
    parametros: [primeiroNome(s.nomeCliente), equipamento.nome],
    equipamentoId: equipamento.id,
    sugestaoId: s.id,
  };
}

export function avisoEquipamentoDesativado(p: { id: string; nomeCliente: string; telefone: string }, equipamento: { id: string; nome: string }): NovoAviso {
  return {
    telefone: p.telefone,
    evento: "equipamento_desativado",
    template: "equipamento_desativado",
    parametros: [primeiroNome(p.nomeCliente), equipamento.nome, codigoSolicitacao(p.id)],
    equipamentoId: equipamento.id,
    solicitacaoId: p.id,
  };
}

// Corpo da chamada POST /{phone-number-id}/messages da Cloud API.
export function corpoTemplate(telefone: string, template: string, parametros: string[], idioma: string) {
  return {
    messaging_product: "whatsapp",
    to: telefone.replace(/\D/g, ""),
    type: "template",
    template: {
      name: template,
      language: { code: idioma },
      components: parametros.length
        ? [{ type: "body", parameters: parametros.map((text) => ({ type: "text", text })) }]
        : [],
    },
  };
}

export type ResultadoEnvio = { ok: true } | { ok: false; erro: string; definitivo: boolean };

// Erros que não melhoram tentando de novo: número sem WhatsApp, template
// inexistente ou com parâmetros errados. Token inválido e limite de envio não
// entram: depois de corrigir a configuração, o Cron envia o que ficou pendente.
const CODIGOS_DEFINITIVOS = new Set([100, 131008, 131009, 131026, 132000, 132001, 132005, 132007, 132012]);

export function interpretarErroCloud(status: number, corpo: unknown): ResultadoEnvio {
  const erro = (corpo as { error?: { code?: number; message?: string } } | null)?.error;
  const codigo = erro?.code;
  const mensagem = `${status}${codigo ? ` (${codigo})` : ""}: ${erro?.message ?? "erro desconhecido"}`.slice(0, 500);
  return { ok: false, erro: mensagem, definitivo: codigo !== undefined && CODIGOS_DEFINITIVOS.has(codigo) };
}

// Depois de uma falha: continua pendente para o Cron tentar de novo, ou
// desiste quando o erro é definitivo ou as tentativas acabaram.
export function statusDepoisDaFalha(tentativas: number, definitivo: boolean): "pendente" | "falhou" {
  return definitivo || tentativas >= MAX_TENTATIVAS_AVISO ? "falhou" : "pendente";
}

type SituacaoEquipamento = { ativo: boolean; disponivel: boolean };

// O que uma mudança no equipamento dispara. "Voltou" é passar a estar ativo
// e disponível (inclusive ao reativar um equipamento que já estava marcado
// como disponível); "desativado" é sair do catálogo.
export function efeitosDaMudanca(antes: SituacaoEquipamento, depois: SituacaoEquipamento) {
  const alugavel = (s: SituacaoEquipamento) => s.ativo && s.disponivel;
  return {
    voltou: !alugavel(antes) && alugavel(depois),
    desativado: antes.ativo && !depois.ativo,
  };
}
