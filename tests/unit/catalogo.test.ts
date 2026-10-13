import { describe, expect, it } from "vitest";
import { hrefCatalogo, lerFiltros, padraoBusca, TAMANHO_MAXIMO_BUSCA } from "@/lib/catalogo/filtros";
import { urlFoto } from "@/lib/fotos";

describe("lerFiltros", () => {
  it("limpa espaços e ignora filtros vazios", () => {
    expect(lerFiltros({ busca: "  serra   mármore ", categoria: "  " })).toEqual({
      busca: "serra mármore",
      categoria: undefined,
    });
  });

  it("usa o primeiro valor quando o parâmetro se repete", () => {
    expect(lerFiltros({ busca: ["furadeira", "betoneira"], categoria: ["Corte"] })).toEqual({
      busca: "furadeira",
      categoria: "Corte",
    });
  });

  it("limita o tamanho da busca", () => {
    const { busca } = lerFiltros({ busca: "a".repeat(500) });
    expect(busca).toHaveLength(TAMANHO_MAXIMO_BUSCA);
  });

  it("aceita parâmetros ausentes", () => {
    expect(lerFiltros({})).toEqual({ busca: "", categoria: undefined });
  });
});

describe("padraoBusca", () => {
  it("envolve o termo com curingas", () => {
    expect(padraoBusca("serra")).toBe("%serra%");
  });

  it("escapa curingas e barra invertida digitados pelo cliente", () => {
    expect(padraoBusca("50%_a\\b")).toBe("%50\\%\\_a\\\\b%");
  });
});

describe("hrefCatalogo", () => {
  it("monta a URL só com os filtros preenchidos", () => {
    expect(hrefCatalogo({})).toBe("/");
    expect(hrefCatalogo({ categoria: "Acesso e altura" })).toBe("/?categoria=Acesso+e+altura");
    expect(hrefCatalogo({ busca: "serra", categoria: "Corte" })).toBe("/?busca=serra&categoria=Corte");
  });
});

describe("urlFoto", () => {
  it("monta a URL pública do Storage codificando o caminho", () => {
    expect(urlFoto("https://abc.supabase.co/", "equipamentos", "id 1/foto ç.jpg")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/equipamentos/id%201/foto%20%C3%A7.jpg",
    );
  });
});
