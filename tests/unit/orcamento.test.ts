import { describe, expect, it } from "vitest";
import { dataValida, formatarData, hojeNaLocadora, somarDias } from "@/lib/datas";
import { inicioJanela } from "@/lib/limites";
import { codigoSolicitacao, linkWhatsapp, textoSolicitacao } from "@/lib/orcamento/mensagem";
import { hrefOrcamento, lerPreenchimento } from "@/lib/orcamento/params";
import { esquemaSolicitacao, errosPorCampo, lerFormulario } from "@/lib/orcamento/validacao";
import { formatarCelular, mascararCelular, normalizarCelular } from "@/lib/telefone";

const ID_A = "11111111-1111-4111-8111-111111111111";
const ID_B = "22222222-2222-4222-8222-222222222222";

describe("normalizarCelular", () => {
  it.each([
    ["(11) 91234-5678", "+5511912345678"],
    ["11912345678", "+5511912345678"],
    ["+55 21 98765-4321", "+5521987654321"],
    ["011 91234 5678", "+5511912345678"],
  ])("aceita %s", (entrada, esperado) => {
    expect(normalizarCelular(entrada)).toBe(esperado);
  });

  it.each([
    ["(11) 3123-4567", "fixo"],
    ["(20) 91234-5678", "DDD inexistente"],
    ["91234-5678", "sem DDD"],
    ["+1 415 555 0100", "estrangeiro"],
    ["", "vazio"],
  ])("recusa %s (%s)", (entrada) => {
    expect(normalizarCelular(entrada)).toBeNull();
  });

  it("formata e mascara", () => {
    expect(formatarCelular("+5511912345678")).toBe("(11) 91234-5678");
    expect(mascararCelular("11")).toBe("(11");
    expect(mascararCelular("11912")).toBe("(11) 912");
    expect(mascararCelular("119123456789999")).toBe("(11) 91234-5678");
  });
});

describe("datas", () => {
  it("calcula hoje no fuso de São Paulo", () => {
    // 02:00 UTC do dia 13 ainda é dia 12 em São Paulo
    expect(hojeNaLocadora(new Date("2026-10-13T02:00:00Z"))).toBe("2026-10-12");
  });

  it("valida, soma e formata", () => {
    expect(dataValida("2026-02-29")).toBe(false);
    expect(dataValida("2028-02-29")).toBe(true);
    expect(dataValida("12/10/2026")).toBe(false);
    expect(somarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(formatarData("2026-10-20")).toBe("20/10/2026");
  });
});

describe("esquemaSolicitacao", () => {
  const hoje = "2026-10-12";
  const valido = {
    nome: "  Maria   Souza ",
    telefone: "(11) 91234-5678",
    servico: "Trocar o piso da sala",
    dataInicio: "2026-10-15",
    dataFim: "2026-10-17",
    equipamentos: [ID_A, ID_B, ID_A],
    materiais: [],
    aceitaWhatsapp: true,
  };

  it("normaliza um pedido válido", () => {
    const r = esquemaSolicitacao(hoje).parse(valido);
    expect(r.nome).toBe("Maria Souza");
    expect(r.telefone).toBe("+5511912345678");
    expect(r.equipamentos).toEqual([ID_A, ID_B]);
  });

  it("aceita retirada e devolução no mesmo dia, a partir de hoje", () => {
    expect(esquemaSolicitacao(hoje).safeParse({ ...valido, dataInicio: hoje, dataFim: hoje }).success).toBe(true);
  });

  it.each([
    [{ dataInicio: "2026-10-11" }, "dataInicio"],
    [{ dataInicio: "2027-10-13", dataFim: "2027-10-14" }, "dataInicio"],
    [{ dataFim: "2026-10-14" }, "dataFim"],
    [{ dataFim: "" }, "dataFim"],
    [{ equipamentos: [] }, "equipamentos"],
    [{ equipamentos: ["nao-e-uuid"] }, "equipamentos"],
    [{ telefone: "1234" }, "telefone"],
    [{ nome: " a " }, "nome"],
    [{ servico: "oi" }, "servico"],
  ])("recusa %o no campo %s", (mudanca, campo) => {
    const r = esquemaSolicitacao(hoje).safeParse({ ...valido, ...mudanca });
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(errosPorCampo(r.error))).toContain(campo);
  });
});

describe("mensagens de campo vazio", () => {
  it("pede para informar em vez de falar de tamanho mínimo", () => {
    const r = esquemaSolicitacao("2026-10-12").safeParse({
      nome: "  ",
      telefone: "",
      servico: "",
      dataInicio: "",
      dataFim: "",
      equipamentos: [],
      aceitaWhatsapp: false,
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const erros = errosPorCampo(r.error);
      expect(erros.nome).toBe("Informe seu nome.");
      expect(erros.servico).toBe("Descreva o serviço.");
    }
  });
});

describe("lerFormulario", () => {
  it("lê campos múltiplos e o checkbox", () => {
    const fd = new FormData();
    fd.append("nome", "Ana");
    fd.append("equipamentos", ID_A);
    fd.append("equipamentos", ID_B);
    fd.append("materiais", "Cimento");
    fd.append("aceitaWhatsapp", "on");
    const r = lerFormulario(fd);
    expect(r.equipamentos).toEqual([ID_A, ID_B]);
    expect(r.materiais).toEqual(["Cimento"]);
    expect(r.aceitaWhatsapp).toBe(true);
    expect(r.telefone).toBe("");
  });
});

describe("mensagem do pedido", () => {
  const resumo = {
    id: "abcdef12-3456-4789-8abc-def012345678",
    nome: "Maria Souza",
    telefone: "+5511912345678",
    servico: "Trocar o piso & rejunte",
    dataInicio: "2026-10-15",
    dataFim: "2026-10-17",
    equipamentos: ["Martelete rompedor 10 kg", "Serra mármore"],
    materiais: ["Argamassa AC-III"],
  };

  it("monta o texto com código, período, equipamentos e materiais", () => {
    const texto = textoSolicitacao(resumo);
    expect(codigoSolicitacao(resumo.id)).toBe("ABCDEF12");
    expect(texto).toContain("pedido ABCDEF12");
    expect(texto).toContain("(11) 91234-5678");
    expect(texto).toContain("15/10/2026 a 17/10/2026");
    expect(texto).toContain("- Serra mármore");
    expect(texto).toContain("- Argamassa AC-III");
  });

  it("omite a seção de materiais quando não há", () => {
    expect(textoSolicitacao({ ...resumo, materiais: [] })).not.toContain("Materiais");
  });

  it("gera o link wa.me com o texto codificado", () => {
    const link = linkWhatsapp("+55 (11) 91234-5678", "Olá & até já");
    expect(link).toBe("https://wa.me/5511912345678?text=Ol%C3%A1%20%26%20at%C3%A9%20j%C3%A1");
  });
});

describe("preenchimento via URL", () => {
  it("lê equipamentos separados por vírgula ou repetidos, sem duplicar", () => {
    const r = lerPreenchimento({ equipamentos: [`${ID_A},${ID_B}`, ID_A], servico: "Piso", materiais: ["Areia", " "] });
    expect(r).toEqual({ equipamentos: [ID_A, ID_B], servico: "Piso", materiais: ["Areia"] });
  });

  it("monta o link e lê de volta", () => {
    const href = hrefOrcamento({ equipamentos: [ID_A], servico: "Piso da sala", materiais: ["Areia", "Cimento"] });
    const params = Object.fromEntries(
      [...new URL(href, "http://x").searchParams.keys()].map((k) => [k, new URL(href, "http://x").searchParams.getAll(k)]),
    );
    expect(lerPreenchimento(params)).toEqual({
      equipamentos: [ID_A],
      servico: "Piso da sala",
      materiais: ["Areia", "Cimento"],
    });
  });
});

describe("inicioJanela", () => {
  it("arredonda para a hora e para o dia", () => {
    const agora = new Date("2026-10-12T15:42:10.123Z");
    expect(inicioJanela(agora, "hora").toISOString()).toBe("2026-10-12T15:00:00.000Z");
    expect(inicioJanela(agora, "dia").toISOString()).toBe("2026-10-12T00:00:00.000Z");
  });
});
