import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GaleriaFotos } from "@/components/catalogo/galeria-fotos";
import { SeloDisponibilidade } from "@/components/catalogo/selo-disponibilidade";
import { obterEquipamento } from "@/lib/catalogo/consultas";

export async function generateMetadata({
  params,
}: PageProps<"/equipamentos/[id]">): Promise<Metadata> {
  const { id } = await params;
  const equipamento = await obterEquipamento(id);
  if (!equipamento) return { title: "Equipamento não encontrado" };
  return {
    title: equipamento.nome,
    description: equipamento.descricao.slice(0, 160),
    openGraph: { images: equipamento.fotos.slice(0, 1) },
  };
}

export default function EquipamentoPage({ params }: PageProps<"/equipamentos/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Voltar ao catálogo
      </Link>
      <Suspense fallback={<DetalheCarregando />}>
        {params.then(({ id }) => (
          <Detalhe id={id} />
        ))}
      </Suspense>
    </main>
  );
}

async function Detalhe({ id }: { id: string }) {
  const equipamento = await obterEquipamento(id);
  if (!equipamento) notFound();

  return (
    <article className="grid gap-6 md:grid-cols-2 md:gap-10">
      <GaleriaFotos fotos={equipamento.fotos} nome={equipamento.nome} />
      <div className="flex flex-col gap-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {equipamento.categoria}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{equipamento.nome}</h1>
        <SeloDisponibilidade disponivel={equipamento.disponivel} />
        <p className="whitespace-pre-line leading-relaxed">{equipamento.descricao}</p>
        <p className="text-sm text-muted-foreground">
          Preço e condições são combinados direto com a locadora no orçamento.
        </p>
      </div>
    </article>
  );
}

function DetalheCarregando() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando equipamento"
      className="grid gap-6 md:grid-cols-2 md:gap-10"
    >
      <div className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
