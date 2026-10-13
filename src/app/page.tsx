import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { BuscaCatalogo } from "@/components/catalogo/busca-catalogo";
import { CartaoEquipamento } from "@/components/catalogo/cartao-equipamento";
import { FiltroCategorias } from "@/components/catalogo/filtro-categorias";
import { TopoHome } from "@/components/home/topo-home";
import { buttonVariants } from "@/components/ui/button";
import { lerFiltros } from "@/lib/catalogo/filtros";
import { listarCategorias, listarEquipamentos } from "@/lib/catalogo/consultas";

const PASSOS = [
  {
    titulo: "Conte o serviço",
    texto: "Descreva a obra para o assistente ou escolha direto no catálogo. Ele indica só o que a locadora tem disponível.",
  },
  {
    titulo: "Peça o orçamento",
    texto: "Informe nome, WhatsApp e o período. Sem cadastro e sem senha.",
  },
  {
    titulo: "Combine no WhatsApp",
    texto: "A locadora responde com preço, condições e retirada. Você fecha direto com ela.",
  },
];

const PERGUNTAS = [
  {
    pergunta: "Preciso criar conta para pedir orçamento?",
    resposta: "Não. Você informa nome, WhatsApp e o período, e a locadora entra em contato.",
  },
  {
    pergunta: "Quanto custa o aluguel?",
    resposta:
      "O preço depende do equipamento e do período. A locadora informa o valor e as condições no orçamento, pelo WhatsApp.",
  },
  {
    pergunta: "O pedido já reserva o equipamento?",
    resposta: "Não. O pedido de orçamento não é uma reserva: a disponibilidade e a retirada são confirmadas pela locadora.",
  },
  {
    pergunta: "Como o assistente escolhe os equipamentos?",
    resposta:
      "Ele só indica equipamentos do catálogo desta locadora que estão disponíveis, e lista os materiais que você provavelmente vai comprar à parte.",
  },
  {
    pergunta: "E se o equipamento estiver indisponível?",
    resposta:
      "Ele continua no catálogo, marcado como indisponível. Você pode pedir orçamento de outro parecido ou perguntar ao assistente o que serve no lugar.",
  },
];

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <main className="flex flex-1 flex-col">
      <TopoHome />

      <section id="catalogo" aria-labelledby="titulo-catalogo" className="scroll-mt-4 bg-concreto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 md:py-20">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <h2 id="titulo-catalogo" className="text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.02em]">
              Equipamentos para alugar
            </h2>
            <p className="max-w-md text-muted-foreground">
              Fotos, descrição e disponibilidade de cada equipamento. Escolha e peça o orçamento.
            </p>
          </div>
          <Suspense fallback={<CatalogoCarregando />}>
            <Catalogo searchParams={searchParams} />
          </Suspense>
        </div>
      </section>

      <section aria-labelledby="titulo-passos" className="bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.5fr] md:py-24">
          <div className="flex flex-col gap-4">
            <h2 id="titulo-passos" className="text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.02em]">
              Do serviço ao orçamento, sem enrolação
            </h2>
            <p className="max-w-sm text-muted-foreground">
              Você não precisa saber o nome do equipamento. Precisa saber o que vai fazer.
            </p>
          </div>
          <ol className="flex flex-col">
            {PASSOS.map((passo, i) => (
              <li
                key={passo.titulo}
                className="grid grid-cols-[3.5rem_1fr] gap-x-5 border-t border-terra/12 py-7 first:border-t-0 first:pt-0 sm:grid-cols-[5rem_1fr]"
              >
                <span aria-hidden className="font-heading text-5xl leading-none font-semibold text-laranja sm:text-6xl">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-2xl font-semibold">{passo.titulo}</h3>
                  <p className="max-w-[52ch] text-muted-foreground">{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="titulo-perguntas" className="bg-concreto">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.5fr] md:py-24">
          <h2 id="titulo-perguntas" className="text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            Perguntas frequentes
          </h2>
          <div className="flex flex-col gap-2">
            {PERGUNTAS.map(({ pergunta, resposta }) => (
              <details key={pergunta} className="group rounded-xl bg-white ring-1 ring-terra/8 open:ring-terra/20">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 font-heading text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {pergunta}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-concreto transition-[background-color,rotate] duration-300 group-open:rotate-45 group-open:bg-laranja">
                    <Plus aria-hidden className="size-4" />
                  </span>
                </summary>
                <p className="max-w-[60ch] px-5 pb-5 text-muted-foreground">{resposta}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-fechamento" className="bg-laranja text-terra">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:py-16">
          <h2 id="titulo-fechamento" className="max-w-2xl text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            Não achou o que precisa? Conte o serviço para o assistente.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/assistente" className={buttonVariants({ variant: "terra", size: "lg" })}>
              Perguntar ao assistente
              <ArrowRight aria-hidden />
            </Link>
            <Link
              href="/orcamento"
              className={buttonVariants({ variant: "outline", size: "lg", className: "border-terra/40 hover:bg-white/30" })}
            >
              Pedir orçamento
            </Link>
          </div>
        </div>
      </section>
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
              <Link href="/" scroll={false} className="font-medium underline">
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
