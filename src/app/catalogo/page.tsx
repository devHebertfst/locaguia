import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BuscaCatalogo } from "@/components/catalogo/busca-catalogo";
import { CartaoEquipamento } from "@/components/catalogo/cartao-equipamento";
import { FiltroCategorias } from "@/components/catalogo/filtro-categorias";
import { TituloPagina } from "@/components/titulo-pagina";
import { lerFiltros } from "@/lib/catalogo/filtros";
import { listarCategorias, listarEquipamentos } from "@/lib/catalogo/consultas";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Equipamentos de construção para alugar: fotos, descrição e disponibilidade. Peça o orçamento pelo WhatsApp.",
};

export default function CatalogoPage({ searchParams }: PageProps<"/catalogo">) {
  return (
    <main className="flex flex-1 flex-col bg-concreto">
      <TituloPagina
        titulo="Equipamentos para alugar"
        descricao="Fotos, descrição e disponibilidade de cada equipamento. Escolha e peça o orçamento."
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
        <Suspense fallback={<CatalogoCarregando />}>
          <Catalogo searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Catalogo({ searchParams }: Pick<PageProps<"/catalogo">, "searchParams">) {
  const filtros = lerFiltros(await searchParams);
  const [equipamentos, categorias] = await Promise.all([
    listarEquipamentos(filtros),
    listarCategorias(),
  ]);
  const filtrando = Boolean(filtros.busca || filtros.categoria);

  return (
    <>
      <div className="flex flex-col gap-4">
        <BuscaCatalogo buscaAtual={filtros.busca} categoriaAtual={filtros.categoria} />
        <FiltroCategorias categorias={categorias} filtros={filtros} />
      </div>

      {filtrando && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {equipamentos.length === 1
            ? "1 equipamento encontrado"
            : `${equipamentos.length} equipamentos encontrados`}
          {filtros.busca && <> para “{filtros.busca}”</>}
          {filtros.categoria && <> em {filtros.categoria}</>}
        </p>
      )}

      {equipamentos.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {equipamentos.map((equipamento) => (
            <li key={equipamento.id} className="flex">
              <CartaoEquipamento equipamento={equipamento} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-xl border-2 border-dashed border-terra/15 p-8">
          <p className="font-heading text-xl font-semibold">
            {filtrando ? "Nenhum equipamento encontrado." : "Nenhum equipamento cadastrado ainda."}
          </p>
          {filtrando && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link href="/catalogo" scroll={false} className="font-medium underline">
                Ver todos os equipamentos
              </Link>
              <Link href="/assistente" className="font-medium text-laranja-escuro underline">
                Perguntar ao assistente
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function CatalogoCarregando() {
  return (
    <div aria-busy="true" aria-label="Carregando equipamentos" className="flex flex-col gap-4">
      <div className="h-[3.25rem] animate-pulse rounded-full bg-white" />
      <div className="h-9 w-2/3 animate-pulse rounded-full bg-white/70" />
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-white sm:aspect-[4/5] sm:h-auto" />
        ))}
      </div>
    </div>
  );
}
