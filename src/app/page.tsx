import { Suspense } from "react";
import Link from "next/link";
import { BuscaCatalogo } from "@/components/catalogo/busca-catalogo";
import { CartaoEquipamento } from "@/components/catalogo/cartao-equipamento";
import { FiltroCategorias } from "@/components/catalogo/filtro-categorias";
import { lerFiltros } from "@/lib/catalogo/filtros";
import { listarCategorias, listarEquipamentos } from "@/lib/catalogo/consultas";

export default function CatalogoPage({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Equipamentos para alugar</h1>
        <p className="text-muted-foreground">
          Encontre o equipamento para o seu serviço e peça um orçamento pelo WhatsApp.
        </p>
      </div>
      <Suspense fallback={<CatalogoCarregando />}>
        <Catalogo searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Catalogo({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipamentos.map((equipamento) => (
            <li key={equipamento.id} className="flex">
              <CartaoEquipamento equipamento={equipamento} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed p-6">
          <p className="font-medium">
            {filtrando ? "Nenhum equipamento encontrado." : "Nenhum equipamento cadastrado ainda."}
          </p>
          {filtrando && (
            <Link href="/" className="text-sm underline underline-offset-4">
              Ver todos os equipamentos
            </Link>
          )}
        </div>
      )}
    </>
  );
}

function CatalogoCarregando() {
  return (
    <div aria-busy="true" aria-label="Carregando equipamentos" className="flex flex-col gap-4">
      <div className="h-10 animate-pulse rounded-lg bg-muted" />
      <div className="h-8 w-2/3 animate-pulse rounded-full bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
