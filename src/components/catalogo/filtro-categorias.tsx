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
    <nav aria-label="Categorias" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-2 pb-1">
        {opcoes.map(({ rotulo, valor }) => {
          const ativa = filtros.categoria === valor;
          return (
            <li key={rotulo} className="shrink-0">
              <Link
                href={hrefCatalogo({ busca: filtros.busca, categoria: valor })}
                aria-current={ativa ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 items-center rounded-full border px-3 text-sm transition-colors",
                  ativa
                    ? "border-foreground bg-foreground text-background"
                    : "text-muted-foreground hover:border-foreground/40 hover:text-foreground",
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
