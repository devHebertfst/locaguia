import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MessageCircleQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { GaleriaFotos } from "@/components/catalogo/galeria-fotos";
import { SeloDisponibilidade } from "@/components/catalogo/selo-disponibilidade";
import { obterEquipamento } from "@/lib/catalogo/consultas";
import { hrefOrcamento } from "@/lib/orcamento/params";

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
    <main className="flex flex-1 flex-col bg-concreto">
      <div className="chao-terra">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
          <Link
            href="/#catalogo"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white/75 hover:text-white"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Voltar ao catálogo
          </Link>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-14">
        <Suspense fallback={<DetalheCarregando />}>
          {params.then(({ id }) => (
            <Detalhe id={id} />
          ))}
        </Suspense>
      </div>
    </main>
  );
}

async function Detalhe({ id }: { id: string }) {
  const equipamento = await obterEquipamento(id);
  if (!equipamento) notFound();

  return (
    <article className="grid gap-8 md:grid-cols-[1.15fr_1fr] md:gap-12">
      <GaleriaFotos fotos={equipamento.fotos} nome={equipamento.nome} />
      <div className="flex flex-col gap-5 md:py-2">
        <div className="flex flex-col gap-3">
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            {equipamento.nome}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-laranja-escuro ring-1 ring-terra/10">
              {equipamento.categoria}
            </span>
            <SeloDisponibilidade disponivel={equipamento.disponivel} />
          </div>
        </div>
        <p className="max-w-[62ch] text-lg leading-relaxed whitespace-pre-line text-terra-2">{equipamento.descricao}</p>

        <div className="mt-2 flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-terra/8 sm:p-6">
          {equipamento.disponivel ? (
            <Link
              href={hrefOrcamento({ equipamentos: [equipamento.id] })}
              className={buttonVariants({ size: "lg", className: "w-full sm:w-fit" })}
            >
              Pedir orçamento
              <ArrowRight aria-hidden />
            </Link>
          ) : (
            <Link
              href="/assistente"
              className={buttonVariants({ variant: "terra", size: "lg", className: "w-full sm:w-fit" })}
            >
              <MessageCircleQuestion aria-hidden />
              Perguntar o que serve no lugar
            </Link>
          )}
          <p className="text-sm text-muted-foreground">
            Preço e condições são combinados direto com a locadora no orçamento.
          </p>
        </div>
      </div>
    </article>
  );
}

function DetalheCarregando() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando equipamento"
      className="grid gap-8 md:grid-cols-[1.15fr_1fr] md:gap-12"
    >
      <div className="aspect-[4/3] animate-pulse rounded-2xl bg-white" />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-24 animate-pulse rounded bg-white" />
        <div className="h-12 w-3/4 animate-pulse rounded bg-white" />
        <div className="h-28 animate-pulse rounded bg-white" />
      </div>
    </div>
  );
}
