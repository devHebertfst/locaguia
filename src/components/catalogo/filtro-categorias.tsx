import Link from "next/link";
import { hrefCatalogo, type FiltrosCatalogo } from "@/lib/catalogo/filtros";
import { cn } from "@/lib/utils";

type Props = {
  categorias: string[];
  filtros: FiltrosCatalogo;
};

export function FiltroCategorias({ categorias, filtros }: Props) {
  if (categorias.length === 0) return null;
  const opcoes = [{ rotulo: "Todas", valor: undefined }, ...categorias.map((c) => ({ rotulo: c, valor: c }))];

  return (
    <nav aria-label="Categorias" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <ul className="flex gap-2 pb-1">
        {opcoes.map(({ rotulo, valor }) => {
          const ativa = filtros.categoria === valor;
          return (
            <li key={rotulo} className="shrink-0">
              <Link
                href={hrefCatalogo({ busca: filtros.busca, categoria: valor })}
                aria-current={ativa ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors",
                  ativa
                    ? "bg-creme text-terra"
                    : "bg-card text-muted-foreground ring-1 ring-foreground/12 hover:ring-foreground/40",
                )}
              >
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
