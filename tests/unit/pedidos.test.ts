import { describe, expect, it } from "vitest";
import {
  acoesDoStatus,
  diasDoPeriodo,
  formatarRecebido,
  lerFiltroPedido,
  linkWhatsappCliente,
  mensagemParaCliente,
  statusDoFiltro,
  statusValido,
} from "@/lib/pedidos/status";

const ID = "a1b2c3d4-1111-4111-8111-111111111111";

describe("filtros", () => {
  it("abertos é o padrão e cobre novos e em atendimento", () => {
    expect(lerFiltroPedido(undefined)).toBe("abertos");
    expect(lerFiltroPedido("qualquer")).toBe("abertos");
    expect(statusDoFiltro("abertos")).toEqual(["nova", "em_atendimento"]);
  });

  it("aceita cada status e o todos", () => {
    expect(lerFiltroPedido("perdida")).toBe("perdida");
    expect(statusDoFiltro("perdida")).toEqual(["perdida"]);
    expect(statusDoFiltro("todos")).toHaveLength(4);
  });

  it("statusValido recusa valores de fora", () => {
    expect(statusValido("fechada")).toBe(true);
    expect(statusValido("aberta")).toBe(false);
    expect(statusValido(null)).toBe(false);
  });
});

describe("acoesDoStatus", () => {
  it("novo começa atendimento ou é perdido", () => {
    expect(acoesDoStatus("nova").map((a) => a.para)).toEqual(["em_atendimento", "perdida"]);
  });

  it("em atendimento fecha ou perde", () => {
    expect(acoesDoStatus("em_atendimento").map((a) => a.para)).toEqual(["fechada", "perdida"]);
  });

  it("fechado e perdido podem ser reabertos", () => {
    expect(acoesDoStatus("fechada").map((a) => a.para)).toEqual(["em_atendimento"]);
    expect(acoesDoStatus("perdida").map((a) => a.para)).toEqual(["em_atendimento"]);
  });
});

describe("mensagem ao cliente", () => {
  it("usa o primeiro nome, o código e o período", () => {
    const texto = mensagemParaCliente({ id: ID, nome: "  Maria da Silva ", dataInicio: "2026-10-20", dataFim: "2026-10-22" });
    expect(texto).toBe("Olá, Maria! Aqui é da locadora, sobre o seu pedido de orçamento A1B2C3D4 para 20/10/2026 a 22/10/2026.");
  });

  it("monta o link wa.me só com dígitos", () => {
    expect(linkWhatsappCliente("+5511912345678", "Oi, tudo bem?")).toBe("https://wa.me/5511912345678?text=Oi%2C%20tudo%20bem%3F");
  });
});

describe("formatarRecebido", () => {
  // 13/10/2026 15:00 em São Paulo (UTC-3)
  const agora = new Date("2026-10-13T18:00:00Z");

  it("hoje e ontem no fuso da loja", () => {
    expect(formatarRecebido(new Date("2026-10-13T12:05:00Z"), agora)).toBe("hoje, 09:05");
    expect(formatarRecebido(new Date("2026-10-13T02:30:00Z"), agora)).toBe("ontem, 23:30");
  });

  it("dias anteriores com a data", () => {
    expect(formatarRecebido(new Date("2026-10-10T21:40:00Z"), agora)).toBe("10/10/2026, 18:40");
  });
});

describe("diasDoPeriodo", () => {
  it("conta a retirada e a devolução", () => {
    expect(diasDoPeriodo("2026-10-20", "2026-10-20")).toBe(1);
    expect(diasDoPeriodo("2026-10-20", "2026-10-22")).toBe(3);
    expect(diasDoPeriodo("2026-10-30", "2026-11-02")).toBe(4);
  });
});
