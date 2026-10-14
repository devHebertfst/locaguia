import { describe, expect, it } from "vitest";
import { lerFiltroSugestao, mensagemSobreSugestao, statusDoFiltroSugestao } from "@/lib/sugestoes/status";
import {
  errosSugestao,
  esquemaSugestao,
  hrefSugerir,
  lerFormularioSugestao,
  lerPreenchimentoSugestao,
} from "@/lib/sugestoes/validacao";

const ID = "a1b2c3d4-1111-4111-8111-111111111111";

function form(campos: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(campos)) fd.set(k, v);
  return fd;
}

describe("esquemaSugestao", () => {
  it("aceita equipamento novo e guarda o celular em E.164", () => {
    const r = esquemaSugestao.parse(
      lerFormularioSugestao(
        form({ tipo: "novo_equipamento", nomeEquipamento: "  Rompedor   30 kg ", motivo: "", nome: "Ana", telefone: "(11) 91234-5678" }),
      ),
    );
    expect(r).toEqual({
      tipo: "novo_equipamento",
      nomeEquipamento: "Rompedor 30 kg",
      motivo: "",
      nome: "Ana",
      telefone: "+5511912345678",
      querAviso: false,
    });
  });

  it("o aviso só vale se a caixa foi marcada", () => {
    const base = { tipo: "aguardar_disponibilidade", equipamentoId: ID, nome: "Ana", telefone: "11912345678" };
    expect(lerFormularioSugestao(form(base)).querAviso).toBe(false);
    expect(lerFormularioSugestao(form({ ...base, querAviso: "on" })).querAviso).toBe(true);
  });

  it("aguardar exige um id de equipamento válido e ignora o nome do formulário", () => {
    const r = esquemaSugestao.safeParse(
      lerFormularioSugestao(form({ tipo: "aguardar_disponibilidade", equipamentoId: "x", nomeEquipamento: "Qualquer", nome: "Ana", telefone: "11912345678" })),
    );
    expect(r.success).toBe(false);
    expect(errosSugestao(r.error!).equipamentoId).toBe("Equipamento inválido.");

    const ok = esquemaSugestao.parse(
      lerFormularioSugestao(form({ tipo: "aguardar_disponibilidade", equipamentoId: ID, nomeEquipamento: "Qualquer", nome: "Ana", telefone: "11912345678" })),
    );
    expect(ok).not.toHaveProperty("nomeEquipamento");
  });

  it("mostra um erro por campo", () => {
    const r = esquemaSugestao.safeParse(
      lerFormularioSugestao(form({ tipo: "novo_equipamento", nomeEquipamento: "", nome: "", telefone: "1133334444" })),
    );
    expect(errosSugestao(r.error!)).toEqual({
      nomeEquipamento: "Diga qual equipamento você procura.",
      nome: "Informe seu nome.",
      telefone: "Informe um celular com DDD, por exemplo (11) 91234-5678.",
    });
  });

  it("recusa tipo desconhecido", () => {
    expect(esquemaSugestao.safeParse(lerFormularioSugestao(form({ tipo: "outro", nome: "Ana", telefone: "11912345678" }))).success).toBe(false);
  });
});

describe("pré-preenchimento de /sugerir", () => {
  it("monta e lê o link", () => {
    expect(hrefSugerir()).toBe("/sugerir");
    const href = hrefSugerir({ equipamento: "Rompedor 30 kg", servico: "Quebrar laje" });
    expect(href).toBe("/sugerir?equipamento=Rompedor+30+kg&servico=Quebrar+laje");
    const params = Object.fromEntries(new URL(href, "http://x").searchParams);
    expect(lerPreenchimentoSugestao(params)).toEqual({ nomeEquipamento: "Rompedor 30 kg", motivo: "Quebrar laje" });
  });

  it("corta textos longos e aceita parâmetro repetido", () => {
    const r = lerPreenchimentoSugestao({ equipamento: ["a".repeat(300), "b"], servico: undefined });
    expect(r.nomeEquipamento).toHaveLength(120);
    expect(r.motivo).toBe("");
  });
});

describe("filtros do painel", () => {
  it("pendente é o padrão", () => {
    expect(lerFiltroSugestao(undefined)).toBe("pendente");
    expect(lerFiltroSugestao("xyz")).toBe("pendente");
    expect(lerFiltroSugestao("descartada")).toBe("descartada");
    expect(statusDoFiltroSugestao("todas")).toEqual(["pendente", "atendida", "descartada"]);
  });

  it("mensagem para o cliente usa o primeiro nome", () => {
    expect(mensagemSobreSugestao({ nomeCliente: " João Pedro ", nomeEquipamento: "Rompedor 30 kg" })).toBe(
      "Olá, João! Aqui é da locadora, sobre o equipamento que você procurou no site: Rompedor 30 kg.",
    );
  });
});
