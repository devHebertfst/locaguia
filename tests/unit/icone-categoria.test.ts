import { describe, expect, it } from "vitest";
import { ferramentaDaCategoria } from "@/components/home/icone-categoria";

describe("ferramentaDaCategoria", () => {
  it("escolhe a ferramenta pelas categorias de exemplo", () => {
    expect(ferramentaDaCategoria("Perfuração")).toBe("furadeira");
    expect(ferramentaDaCategoria("Demolição")).toBe("martelete");
    expect(ferramentaDaCategoria("Corte")).toBe("serra");
    expect(ferramentaDaCategoria("Concretagem")).toBe("betoneira");
    expect(ferramentaDaCategoria("Compactação")).toBe("compactador");
    expect(ferramentaDaCategoria("Acesso e altura")).toBe("andaime");
    expect(ferramentaDaCategoria("Transporte")).toBe("carrinho");
    expect(ferramentaDaCategoria("Energia")).toBe("gerador");
    expect(ferramentaDaCategoria("Limpeza")).toBe("lavadora");
    expect(ferramentaDaCategoria("Acabamento")).toBe("lixadeira");
  });

  it("ignora acento e maiúsculas", () => {
    expect(ferramentaDaCategoria("PERFURACAO")).toBe("furadeira");
    expect(ferramentaDaCategoria("demolicao e quebra")).toBe("martelete");
  });

  it("usa a chave inglesa para categorias que não conhece", () => {
    expect(ferramentaDaCategoria("Jardinagem")).toBe("chave");
  });
});
