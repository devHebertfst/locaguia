export const TAMANHO_MAXIMO_BUSCA = 100;

export type FiltrosCatalogo = {
  busca: string;
  categoria?: string;
};

type ValorParam = string | string[] | undefined;

function primeiro(valor: ValorParam): string {
  return (Array.isArray(valor) ? valor[0] : valor) ?? "";
}

// Lê os filtros do catálogo a partir dos searchParams da URL (?busca=&categoria=).
export function lerFiltros(params: Record<string, ValorParam>): FiltrosCatalogo {
  const busca = primeiro(params.busca).trim().replace(/\s+/g, " ").slice(0, TAMANHO_MAXIMO_BUSCA);
  const categoria = primeiro(params.categoria).trim();
  return { busca, categoria: categoria || undefined };
}

// Monta o padrão de LIKE escapando os curingas digitados pelo cliente
// (no Postgres, a barra invertida é o escape padrão do LIKE).
export function padraoBusca(busca: string): string {
  return `%${busca.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
}

// Link para o catálogo mantendo os filtros informados.
export function hrefCatalogo(filtros: Partial<FiltrosCatalogo>): string {
  const params = new URLSearchParams();
  if (filtros.busca) params.set("busca", filtros.busca);
  if (filtros.categoria) params.set("categoria", filtros.categoria);
  const query = params.toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}
