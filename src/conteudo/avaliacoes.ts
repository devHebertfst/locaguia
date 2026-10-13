// Avaliações de clientes exibidas na home.
//
// As marcadas com `exemplo: true` foram escritas para mostrar o desenho da
// seção e NUNCA aparecem no site publicado: avaliação inventada mostrada a
// cliente é propaganda enganosa (CDC, art. 37). Para publicar, troque por
// avaliações reais (Google, WhatsApp), com autorização do cliente, e apague
// `exemplo`. Sem nenhuma avaliação real, a seção some em produção.

export type Avaliacao = {
  nome: string;
  // quem é ou o que fez: "Pedreiro", "Reforma do banheiro"
  contexto: string;
  texto: string;
  nota: 1 | 2 | 3 | 4 | 5;
  // onde a avaliação foi feita, se for de uma plataforma pública
  fonte?: "Google" | "WhatsApp";
  exemplo?: true;
};

export const AVALIACOES: Avaliacao[] = [
  {
    nome: "Marcos",
    contexto: "Pedreiro",
    texto:
      "Precisei de um martelete numa sexta à tarde. Mandei o pedido pelo site, me responderam no WhatsApp e no sábado cedo eu já estava quebrando o contrapiso.",
    nota: 5,
    exemplo: true,
  },
  {
    nome: "Juliana",
    contexto: "Reforma do banheiro",
    texto:
      "Eu não sabia nem o nome da máquina de cortar porcelanato. Contei o que ia fazer para o assistente e ele indicou a cortadora e ainda listou a argamassa e os espaçadores.",
    nota: 5,
    exemplo: true,
  },
  {
    nome: "Antônio",
    contexto: "Empreiteiro",
    texto: "Gosto de ver o que está disponível antes de sair de casa. Poupa viagem e telefonema.",
    nota: 5,
    exemplo: true,
  },
  {
    nome: "Renata",
    contexto: "Calçada de casa",
    texto: "Aluguei a betoneira e a placa vibratória para fazer a calçada. Combinei tudo pelo WhatsApp, sem enrolação.",
    nota: 4,
    exemplo: true,
  },
];

// Exemplos só aparecem em desenvolvimento (ou com AVALIACOES_EXEMPLO=1, para
// capturas de tela locais). Lido no build: a home é estática.
export function avaliacoesVisiveis(): Avaliacao[] {
  const mostrarExemplos =
    process.env.NODE_ENV === "development" || process.env.AVALIACOES_EXEMPLO === "1";
  return AVALIACOES.filter((a) => !a.exemplo || mostrarExemplos);
}
