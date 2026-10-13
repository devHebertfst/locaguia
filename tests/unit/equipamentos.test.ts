import { describe, expect, it } from "vitest";
import {
  caminhoFotoValido,
  errosEquipamento,
  esquemaEquipamento,
  lerFormularioEquipamento,
} from "@/lib/equipamentos/validacao";

const ID = "11111111-1111-4111-8111-111111111111";
const OUTRO = "22222222-2222-4222-8222-222222222222";
const ARQUIVO = "33333333-3333-4333-8333-333333333333";

function formulario(campos: Record<string, string>) {
  const dados = new FormData();
  for (const [k, v] of Object.entries(campos)) dados.set(k, v);
  return dados;
}

describe("esquemaEquipamento", () => {
  it("limpa espaços e põe a categoria com inicial maiúscula", () => {
    const r = esquemaEquipamento.parse({
      nome: "  Betoneira   400 litros ",
      categoria: " concretagem ",
      descricao: "  Elétrica.\n\n\n\nMonofásica.  ",
      disponivel: true,
    });
    expect(r).toEqual({
      nome: "Betoneira 400 litros",
      categoria: "Concretagem",
      descricao: "Elétrica.\n\nMonofásica.",
      disponivel: true,
    });
  });

  it("aceita descrição vazia", () => {
    expect(esquemaEquipamento.safeParse({ nome: "Serra", categoria: "Corte", descricao: "", disponivel: false }).success).toBe(true);
  });

  it("exige nome e categoria", () => {
    const r = esquemaEquipamento.safeParse({ nome: "  ", categoria: "", descricao: "", disponivel: true });
    expect(r.success).toBe(false);
    expect(errosEquipamento(r.error!)).toEqual({
      nome: "Informe o nome do equipamento.",
      categoria: "Informe a categoria.",
    });
  });

  it("recusa textos longos demais", () => {
    const r = esquemaEquipamento.safeParse({ nome: "x".repeat(121), categoria: "Corte", descricao: "y".repeat(2001), disponivel: true });
    expect(Object.keys(errosEquipamento(r.error!))).toEqual(["nome", "descricao"]);
  });
});

describe("lerFormularioEquipamento", () => {
  it("lê o checkbox de disponível", () => {
    expect(lerFormularioEquipamento(formulario({ nome: "a", disponivel: "on" })).disponivel).toBe(true);
    expect(lerFormularioEquipamento(formulario({ nome: "a" })).disponivel).toBe(false);
  });
});

describe("caminhoFotoValido", () => {
  it.each([`${ID}/${ARQUIVO}.webp`, `${ID}/${ARQUIVO}.jpg`])("aceita %s", (caminho) => {
    expect(caminhoFotoValido(ID, caminho)).toBe(true);
  });

  it.each([
    `${OUTRO}/${ARQUIVO}.webp`,
    `${ID}/${ARQUIVO}.png`,
    `${ID}/../${OUTRO}/${ARQUIVO}.webp`,
    `${ID}/sub/${ARQUIVO}.webp`,
    `${ID}/foto.webp`,
    `/${ID}/${ARQUIVO}.webp`,
  ])("recusa %s", (caminho) => {
    expect(caminhoFotoValido(ID, caminho)).toBe(false);
  });
});
