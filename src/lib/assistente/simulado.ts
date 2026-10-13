import type { EquipamentoAssistente, MensagemChat } from "./nucleo";

// Respostas fixas no formato do modelo, para os testes e2e não dependerem do
// Gemini. Só é usado com ASSISTENTE_SIMULADO=1.

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function respostaSimulada(
  mensagens: MensagemChat[],
  porCodigo: Map<string, EquipamentoAssistente>,
): string {
  const pergunta = normalizar(mensagens[mensagens.length - 1].texto);
  const resposta = (dados: object) =>
    JSON.stringify({ recomendados: [], indisponiveis: [], materiais: [], servico_resumo: "", ...dados });

  if (/receita|bolo|futebol/.test(pergunta)) {
    return resposta({ tipo: "fora_do_escopo", mensagem: "Só consigo ajudar com obras, reformas e uso de equipamentos." });
  }
  if (pergunta.includes("codigo-falso")) {
    return resposta({
      tipo: "recomendacao",
      mensagem: "Teste de código inexistente.",
      recomendados: [{ codigo: "E999", motivo: "inventado" }],
    });
  }

  const palavras = pergunta.split(/\W+/).filter((p) => p.length >= 4);
  const achados = [...porCodigo].filter(([, e]) =>
    palavras.some((p) => normalizar(`${e.nome} ${e.categoria}`).includes(p)),
  );
  if (achados.length === 0) {
    return resposta({
      tipo: "sem_equipamento",
      mensagem: "Não temos um equipamento para esse serviço no momento.",
      equipamento_faltante: mensagens[mensagens.length - 1].texto.slice(0, 60),
    });
  }
  return resposta({
    tipo: "recomendacao",
    mensagem: "Para esse serviço, estes equipamentos ajudam. Use luvas e óculos de proteção.",
    // Manda todos como recomendados: a validação move os indisponíveis.
    recomendados: achados.map(([codigo]) => ({ codigo, motivo: "Indicado para o serviço descrito." })),
    materiais: ["Disco diamantado", "Argamassa AC-III"],
    servico_resumo: mensagens.filter((m) => m.papel === "cliente").map((m) => m.texto).join(" ").slice(0, 200),
  });
}
