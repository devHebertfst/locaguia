import { describe, expect, it } from "vitest";
import { criarToken, tokenValido } from "@/lib/assistente/liberacao";
import {
  esquemaConversa,
  historicoParaModelo,
  instrucoesSistema,
  interpretarResposta,
  montarCatalogo,
  textoDoAssistenteParaHistorico,
  type EquipamentoAssistente,
} from "@/lib/assistente/nucleo";
import { respostaSimulada } from "@/lib/assistente/simulado";

const catalogo: EquipamentoAssistente[] = [
  { id: "id-serra", nome: "Serra mármore", categoria: "Corte", descricao: "Corta piso e porcelanato.", disponivel: true },
  { id: "id-martelete", nome: "Martelete rompedor", categoria: "Demolição", descricao: "Quebra piso.", disponivel: true },
  { id: "id-placa", nome: "Placa vibratória", categoria: "Compactação", descricao: "Compacta solo.", disponivel: false },
];
const { texto, porCodigo } = montarCatalogo(catalogo);

const resposta = (dados: object) =>
  JSON.stringify({
    tipo: "recomendacao",
    mensagem: "Use óculos de proteção.",
    recomendados: [],
    indisponiveis: [],
    materiais: [],
    servico_resumo: "Troca de piso",
    ...dados,
  });

describe("montarCatalogo", () => {
  it("usa códigos curtos e marca a situação de cada equipamento", () => {
    expect(texto.split("\n")).toEqual([
      "E1 | DISPONÍVEL | Corte | Serra mármore | Corta piso e porcelanato.",
      "E2 | DISPONÍVEL | Demolição | Martelete rompedor | Quebra piso.",
      "E3 | INDISPONÍVEL | Compactação | Placa vibratória | Compacta solo.",
    ]);
    expect(porCodigo.get("E2")?.id).toBe("id-martelete");
    expect(instrucoesSistema(texto)).toContain("E3 | INDISPONÍVEL");
  });
});

describe("interpretarResposta", () => {
  it("troca códigos por equipamentos reais e descarta códigos inventados", () => {
    const r = interpretarResposta(
      resposta({
        recomendados: [
          { codigo: "E1", motivo: "Corta o porcelanato." },
          { codigo: "E99", motivo: "Inventado" },
          { codigo: "e2", motivo: "Quebra o piso antigo." },
          { codigo: "E1", motivo: "Repetido" },
        ],
      }),
      porCodigo,
    );
    expect(r?.recomendados.map((e) => e.id)).toEqual(["id-serra", "id-martelete"]);
    expect(r?.recomendados[0]).toMatchObject({ nome: "Serra mármore", motivo: "Corta o porcelanato." });
  });

  it("nunca recomenda indisponível: move para a lista de indisponíveis", () => {
    const r = interpretarResposta(resposta({ recomendados: [{ codigo: "E3", motivo: "Compacta" }] }), porCodigo);
    expect(r?.recomendados).toEqual([]);
    expect(r?.indisponiveis.map((e) => e.id)).toEqual(["id-placa"]);
    expect(r?.tipo).toBe("sem_equipamento");
  });

  it("corrige o tipo quando há recomendação válida", () => {
    const r = interpretarResposta(
      resposta({ tipo: "sem_equipamento", recomendados: [{ codigo: "E1", motivo: "" }] }),
      porCodigo,
    );
    expect(r?.tipo).toBe("recomendacao");
    expect(r?.equipamentoFaltante).toBeUndefined();
  });

  it("fora do escopo não leva equipamentos, materiais nem resumo", () => {
    const r = interpretarResposta(
      resposta({ tipo: "fora_do_escopo", recomendados: [{ codigo: "E1", motivo: "" }], materiais: ["Farinha"] }),
      porCodigo,
    );
    expect(r).toMatchObject({ tipo: "fora_do_escopo", recomendados: [], materiais: [], servicoResumo: "" });
  });

  it("limpa, deduplica e limita os materiais", () => {
    const materiais = ["  Argamassa  AC-III ", "Argamassa AC-III", ...Array.from({ length: 30 }, (_, i) => `Item ${i}`)];
    const r = interpretarResposta(resposta({ recomendados: [{ codigo: "E1", motivo: "" }], materiais }), porCodigo);
    expect(r?.materiais[0]).toBe("Argamassa AC-III");
    expect(r?.materiais).toHaveLength(15);
  });

  it("tolera campos opcionais quebrados e recusa formato inválido", () => {
    expect(interpretarResposta("isto não é json", porCodigo)).toBeNull();
    expect(interpretarResposta(JSON.stringify({ tipo: "recomendacao" }), porCodigo)).toBeNull();
    const r = interpretarResposta(
      JSON.stringify({ tipo: "inventado", mensagem: "Qual o tamanho da área?", recomendados: "x" }),
      porCodigo,
    );
    expect(r).toMatchObject({ tipo: "pergunta", recomendados: [], materiais: [] });
  });

  it("guarda o equipamento faltante só quando não há o que recomendar", () => {
    const r = interpretarResposta(
      resposta({ tipo: "sem_equipamento", equipamento_faltante: "Guindaste" }),
      porCodigo,
    );
    expect(r).toMatchObject({ tipo: "sem_equipamento", equipamentoFaltante: "Guindaste" });
  });
});

describe("conversa", () => {
  const esquema = esquemaConversa(2);

  it("exige que a última mensagem seja do cliente e respeita o tamanho", () => {
    expect(esquema.safeParse([{ papel: "cliente", texto: "piso" }]).success).toBe(true);
    expect(esquema.safeParse([{ papel: "assistente", texto: "oi" }]).success).toBe(false);
    expect(esquema.safeParse([{ papel: "cliente", texto: "a".repeat(1001) }]).success).toBe(false);
    expect(esquema.safeParse([]).success).toBe(false);
  });

  it("acusa o limite de mensagens da conversa", () => {
    const r = esquema.safeParse([
      { papel: "cliente", texto: "1" },
      { papel: "assistente", texto: "a" },
      { papel: "cliente", texto: "2" },
      { papel: "assistente", texto: "b" },
      { papel: "cliente", texto: "3" },
    ]);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.message)).toContain("limite_conversa");
  });

  it("converte o histórico para o Gemini, com o contexto do que foi recomendado", () => {
    const r = interpretarResposta(
      resposta({ recomendados: [{ codigo: "E1", motivo: "" }], materiais: ["Disco"] }),
      porCodigo,
    )!;
    const textoAssistente = textoDoAssistenteParaHistorico(r);
    expect(textoAssistente).toContain("(Recomendados: Serra mármore)");
    expect(historicoParaModelo([{ papel: "cliente", texto: "piso" }, { papel: "assistente", texto: textoAssistente }]))
      .toEqual([
        { role: "user", parts: [{ text: "piso" }] },
        { role: "model", parts: [{ text: textoAssistente }] },
      ]);
  });
});

describe("respostaSimulada", () => {
  it("gera respostas no formato do modelo", () => {
    const r = interpretarResposta(respostaSimulada([{ papel: "cliente", texto: "preciso de uma serra e uma placa" }], porCodigo), porCodigo);
    expect(r?.recomendados.map((e) => e.id)).toEqual(["id-serra"]);
    expect(r?.indisponiveis.map((e) => e.id)).toEqual(["id-placa"]);
    expect(interpretarResposta(respostaSimulada([{ papel: "cliente", texto: "receita de bolo" }], porCodigo), porCodigo)?.tipo)
      .toBe("fora_do_escopo");
  });
});

describe("liberação da conversa", () => {
  const segredo = "segredo-de-teste";
  const agora = Date.parse("2026-10-12T15:00:00Z");

  it("aceita o próprio token dentro da validade", () => {
    expect(tokenValido(criarToken(segredo, agora), segredo, agora + 30 * 60_000)).toBe(true);
  });

  it("recusa token vencido, adulterado ou de outro segredo", () => {
    const token = criarToken(segredo, agora);
    const [expira, assinatura] = token.split(".");
    expect(tokenValido(token, segredo, agora + 61 * 60_000)).toBe(false);
    expect(tokenValido(`${Number(expira) + 3600}.${assinatura}`, segredo, agora)).toBe(false);
    expect(tokenValido(token, "outro-segredo", agora)).toBe(false);
    expect(tokenValido(undefined, segredo, agora)).toBe(false);
    expect(tokenValido("lixo", segredo, agora)).toBe(false);
  });
});
