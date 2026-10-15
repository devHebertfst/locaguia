import { Suspense, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { Avaliacoes } from "@/components/home/avaliacoes";
import { FraseConcreto } from "@/components/home/frase-concreto";
import { IconeCategoria } from "@/components/home/icone-categoria";
import { MarteleteFechamento } from "@/components/home/martelete-fechamento";
import { PassosParafusados } from "@/components/home/passos-parafusados";
import { TopoHome } from "@/components/home/topo-home";
import { TrilhoVitrine } from "@/components/home/trilho-vitrine";
import { FotoEquipamento } from "@/components/catalogo/foto-equipamento";
import { buttonVariants } from "@/components/ui/button";
import { hrefCatalogo } from "@/lib/catalogo/filtros";
import { listarEquipamentos, resumoCategorias } from "@/lib/catalogo/consultas";
import { cn } from "@/lib/utils";

// Fotos de obra do Unsplash (licença livre). A query precisa ser igual à
// liberada em next.config.ts (remotePatterns).
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=2000&q=80&fm=jpg`;

const FOTOS = {
  profissional: {
    src: unsplash("1694522362256-6c907336af43"),
    alt: "Profissional de capacete cortando uma placa de concreto com esmerilhadeira",
    credito: "Glenov Brankovic",
  },
  reforma: {
    src: unsplash("1506367797262-92b157df3c61"),
    alt: "Pés de uma pessoa sobre um piso de pastilhas brancas e rosadas, visto de cima",
    credito: "Kelly Sikkema",
  },
};

const MOTIVOS = [
  {
    titulo: "Sem gastar com compra",
    texto: "Uma betoneira ou um martelete custam caro para usar em um fim de semana. Alugando, você paga só pelo período da obra.",
  },
  {
    titulo: "Sem máquina parada em casa",
    texto: "Nada de guardar, limpar e cuidar de equipamento que vai ficar meses encostado. Usou, devolve.",
  },
  {
    titulo: "A ferramenta certa em cada etapa",
    texto: "Quebrar, concretar, cortar piso, lixar parede: cada fase pede um equipamento diferente, e você troca conforme a obra anda.",
  },
];

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

const tituloSecao = "text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.02em]";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <TopoHome />
      <FraseConcreto />

      <section aria-labelledby="titulo-vitrine" className="overflow-x-clip bg-concreto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 id="titulo-vitrine" className={tituloSecao}>
                Na loja agora
              </h2>
              <p className="max-w-[48ch] text-lg leading-relaxed text-muted-foreground">
                Equipamentos disponíveis para alugar. Toque em um para ver os detalhes e pedir orçamento.
              </p>
            </div>
            <Link href="/catalogo" className="group inline-flex items-center gap-2 font-semibold text-laranja">
              <span className="underline decoration-2 underline-offset-4">Ver o catálogo completo</span>
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <Suspense fallback={<VitrineCarregando />}>
            <Vitrine />
          </Suspense>
        </div>
      </section>

      <section aria-labelledby="titulo-para-quem" className="bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 md:py-24">
          <h2 id="titulo-para-quem" className={`${tituloSecao} max-w-2xl`}>
            Para quem é do ramo e para quem nunca alugou
          </h2>
          <div className="grid gap-10 md:grid-cols-2 md:gap-8">
            <Publico
              foto={FOTOS.profissional}
              titulo="Pedreiro, empreiteiro, profissional"
              texto="Você já sabe o que precisa. Ache o equipamento, veja na hora se está disponível e peça o orçamento sem ligar nem esperar."
              acao={{ href: "/catalogo", rotulo: "Ir para o catálogo" }}
            />
            <Publico
              foto={FOTOS.reforma}
              titulo="Vai reformar a casa"
              texto="Não sabe o nome da máquina? Conte o serviço com suas palavras. O assistente indica o que alugar e lista o material que você vai comprar."
              acao={{ href: "/assistente", rotulo: "Perguntar ao assistente" }}
              deslocada
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-categorias" className="bg-concreto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 md:py-24">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 id="titulo-categorias" className={tituloSecao}>
              Equipamentos por tipo de serviço
            </h2>
            <Link href="/catalogo" className={buttonVariants({ variant: "terra", size: "lg", className: "w-fit" })}>
              Ver catálogo completo
              <ArrowRight aria-hidden />
            </Link>
          </div>
          <Suspense fallback={<CategoriasCarregando />}>
            <Categorias />
          </Suspense>
        </div>
      </section>

      <section aria-labelledby="titulo-motivos" className="bg-background">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.5fr] md:py-24">
          <div className="flex flex-col gap-4">
            <h2 id="titulo-motivos" className={tituloSecao}>
              Por que alugar em vez de comprar
            </h2>
            <p className="max-w-sm text-muted-foreground">
              Para quem trabalha com obra e para quem faz uma reforma por ano, a conta costuma fechar do mesmo jeito.
            </p>
          </div>
          <ul className="flex flex-col">
            {MOTIVOS.map((m) => (
              <li key={m.titulo} className="flex flex-col gap-2 border-t border-foreground/12 py-7 first:border-t-0 first:pt-0">
                <h3 className="flex items-center gap-3 text-2xl font-semibold">
                  <span aria-hidden className="h-0.5 w-6 rounded-full bg-laranja" />
                  {m.titulo}
                </h3>
                <p className="max-w-[56ch] text-muted-foreground">{m.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="titulo-passos" className="bg-concreto">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.5fr] md:py-24">
          <div className="flex flex-col gap-4">
            <h2 id="titulo-passos" className={tituloSecao}>
              Do serviço ao orçamento, sem enrolação
            </h2>
            <p className="max-w-sm text-muted-foreground">
              Você não precisa saber o nome do equipamento. Precisa saber o que vai fazer.
            </p>
          </div>
          <PassosParafusados passos={PASSOS} />
        </div>
      </section>

      <Avaliacoes />

      <section aria-labelledby="titulo-perguntas" className="bg-background">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.5fr] md:py-24">
          <h2 id="titulo-perguntas" className={tituloSecao}>
            Perguntas frequentes
          </h2>
          <div className="flex flex-col gap-2">
            {PERGUNTAS.map(({ pergunta, resposta }) => (
              <details key={pergunta} className="group rounded-xl bg-concreto ring-1 ring-transparent open:bg-card open:ring-foreground/15">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 font-heading text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {pergunta}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card transition-[background-color,rotate] duration-300 group-open:rotate-45 group-open:bg-laranja">
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
            Bora começar a obra? Conte o serviço para o assistente.
          </h2>
          <div className="flex items-end gap-5">
            <div className="flex flex-wrap gap-3">
              <Link href="/assistente" className={cn(buttonVariants({ variant: "terra", size: "lg" }), "bg-terra text-creme hover:bg-terra-2")}>
                Perguntar ao assistente
                <ArrowRight aria-hidden />
              </Link>
              <Link
                href="/catalogo"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-terra/40 text-terra hover:border-terra hover:bg-white/30")}
              >
                Ver o catálogo
              </Link>
            </div>
            <MarteleteFechamento />
          </div>
        </div>
      </section>
    </main>
  );
}

function Publico({
  foto,
  titulo,
  texto,
  acao,
  deslocada,
}: {
  foto: { src: string; alt: string; credito: string };
  titulo: string;
  texto: string;
  acao: { href: string; rotulo: string };
  deslocada?: boolean;
}) {
  return (
    <article className={deslocada ? "flex flex-col gap-5 md:mt-20" : "flex flex-col gap-5"}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-concreto md:aspect-[5/4]">
        <Image src={foto.src} alt={foto.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
        <span className="absolute right-3 bottom-3 rounded-full bg-terra/70 px-2 py-0.5 text-xs text-white/80">
          Foto: {foto.credito} / Unsplash
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-medium tracking-[-0.015em]">{titulo}</h3>
        <p className="max-w-[48ch] text-lg leading-relaxed text-muted-foreground">{texto}</p>
      </div>
      <Link href={acao.href} className="group inline-flex w-fit items-center gap-2 font-semibold text-laranja">
        <span className="underline decoration-2 underline-offset-4">{acao.rotulo}</span>
        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}

const LIMITE_VITRINE = 12;

// Só equipamentos disponíveis: a vitrine mostra o que dá para alugar hoje. Sem nenhum, a faixa some.
async function Vitrine() {
  await connection(); // lido a cada pedido, como o catálogo: nunca no build
  const disponiveis = (await listarEquipamentos({ busca: "" })).filter((e) => e.disponivel);
  if (disponiveis.length === 0) {
    return <p className="text-muted-foreground">Nenhum equipamento disponível neste momento. Veja o catálogo completo.</p>;
  }
  // Com foto primeiro: a vitrine é a primeira impressão do catálogo.
  const itens = [...disponiveis].sort((a, b) => Number(b.fotos.length > 0) - Number(a.fotos.length > 0)).slice(0, LIMITE_VITRINE);
  return (
    <TrilhoVitrine rotulo="Equipamentos disponíveis">
      {itens.map((e, i) => (
        <li key={e.id} className="w-[16.5rem] shrink-0 sm:w-[19rem]" style={{ "--peso": 0.8 + (i % 3) * 0.17 } as CSSProperties}>
          <Link
            href={`/equipamentos/${e.id}`}
            className="group flex h-full flex-col gap-4 rounded-xl bg-card p-2.5 ring-1 ring-foreground/8 transition-[box-shadow,translate] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgb(0_0_0/0.6)] sm:p-3"
          >
            <span className="relative block">
              <FotoEquipamento src={e.fotos[0]} alt={e.nome} sizes="(min-width: 640px) 304px, 264px" className="rounded-lg" />
              <EtiquetaPendurada />
            </span>
            <span className="flex flex-1 flex-col gap-1 px-1.5 pb-1">
              <span className="font-heading text-lg leading-snug font-semibold">{e.nome}</span>
              <span className="text-sm font-medium text-laranja">{e.categoria}</span>
              <span className="mt-auto flex items-center justify-between gap-3 pt-3">
                <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">Ver detalhes</span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-concreto transition-colors group-hover:bg-laranja group-hover:text-terra">
                  <ArrowUpRight aria-hidden className="size-4" />
                </span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </TrilhoVitrine>
  );
}

// Etiqueta laranja pendurada num prego no canto da foto. Balança com a
// esteira (--balanco, calculado no trilho), cada cartão com um peso diferente.
function EtiquetaPendurada() {
  return (
    <span className="absolute -top-1 right-5 flex origin-top flex-col items-center [transform:rotate(calc(var(--balanco,0deg)*var(--peso,1)))]">
      <span aria-hidden className="size-2.5 rounded-full bg-terra-2 ring-2 ring-terra" />
      <span aria-hidden className="h-4 w-px bg-creme/70" />
      <span className="relative rounded-md bg-laranja px-2.5 pt-2.5 pb-1.5 font-heading text-xs font-bold tracking-wide text-terra uppercase shadow-[0_6px_14px_-6px_rgb(0_0_0/0.7)]">
        <span aria-hidden className="absolute top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-terra/70" />
        Disponível
      </span>
    </span>
  );
}

function VitrineCarregando() {
  return (
    <div aria-busy="true" aria-label="Carregando equipamentos" className="flex gap-3 overflow-hidden sm:gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-[22rem] w-[16.5rem] shrink-0 animate-pulse rounded-xl bg-card sm:w-[19rem]" />
      ))}
    </div>
  );
}

async function Categorias() {
  await connection(); // lido a cada pedido, como o catálogo: nunca no build
  const categorias = await resumoCategorias();
  if (categorias.length === 0) {
    return <p className="text-muted-foreground">O catálogo ainda está sendo montado.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {categorias.map(({ categoria, total }) => (
        <li key={categoria}>
          <Link
            href={hrefCatalogo({ categoria })}
            className="group flex h-full items-center justify-between gap-4 rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/8 transition-[box-shadow,translate] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgb(36_29_23/0.35)]"
          >
            <span className="flex items-center gap-4">
              <IconeCategoria categoria={categoria} />
              <span className="flex flex-col gap-0.5">
                <span className="font-heading text-xl font-semibold">{categoria}</span>
                <span className="text-sm text-muted-foreground">
                  {total === 1 ? "1 equipamento" : `${total} equipamentos`}
                </span>
              </span>
            </span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-concreto transition-colors group-hover:bg-laranja">
              <ArrowUpRight aria-hidden className="size-4" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CategoriasCarregando() {
  return (
    <div aria-busy="true" aria-label="Carregando categorias" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="h-[5.5rem] animate-pulse rounded-xl bg-card" />
      ))}
    </div>
  );
}
