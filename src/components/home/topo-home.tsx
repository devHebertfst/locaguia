"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LIMITES_ASSISTENTE } from "@/lib/assistente/nucleo";
import { Betoneira3D, EVENTO_MISTURAR } from "./betoneira-3d";

const EXEMPLOS = ["Trocar o piso da sala", "Fazer uma calçada", "Quebrar uma parede"];

const hrefPergunta = (pergunta: string) => `/assistente?pergunta=${encodeURIComponent(pergunta)}`;

export function TopoHome() {
  const router = useRouter();
  const [texto, setTexto] = useState("");

  function perguntar(pergunta: string) {
    const limpa = pergunta.trim();
    if (!limpa) {
      document.getElementById("pergunta-topo")?.focus();
      return;
    }
    // O tambor acelera antes de ir para o assistente: o pedido "entra" na betoneira.
    window.dispatchEvent(new Event(EVENTO_MISTURAR));
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => router.push(hrefPergunta(limpa)), reduzir ? 0 : 450);
  }

  return (
    <section className="chao-terra relative isolate overflow-hidden">
      {/* Grade de prumo ao fundo, como a planta riscada no canteiro. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_45%,#000_20%,transparent_75%)]"
      />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-2 px-4 pt-10 pb-12 sm:px-6 md:min-h-[min(46rem,calc(100svh-4rem))] md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-8 md:py-16">
        <div className="relative z-10 flex flex-col gap-6">
          <h1 className="text-[clamp(2.4rem,6.2vw,4.6rem)] leading-[1.02] font-medium tracking-[-0.025em] text-white">
            Diga o serviço.
            <br />
            <span className="text-laranja">A gente separa o equipamento.</span>
          </h1>
          <p className="max-w-[46ch] text-lg leading-relaxed text-white/75">
            Aluguel de equipamentos para obra e reforma. Conte o que você vai fazer e veja o que precisa,
            sem cadastro. O orçamento sai pelo WhatsApp.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              perguntar(texto);
            }}
            className="flex max-w-xl flex-col gap-3"
          >
            <label htmlFor="pergunta-topo" className="text-sm font-medium text-white/90">
              Qual serviço você vai fazer?
            </label>
            <div className="flex flex-col gap-2 rounded-[1.4rem] bg-[#fff4ea] p-2 ring-pessego transition-shadow focus-within:ring-4 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.7)] sm:flex-row sm:items-center sm:rounded-full">
              <input
                id="pergunta-topo"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                maxLength={LIMITES_ASSISTENTE.tamanhoMensagem}
                placeholder="Ex.: vou reformar o banheiro"
                className="h-12 min-w-0 flex-1 rounded-full bg-transparent px-4 text-base text-terra outline-none placeholder:text-[#6b655f]"
              />
              <Button type="submit" size="lg" className="sm:shrink-0">
                Perguntar ao assistente
                <ArrowRight aria-hidden />
              </Button>
            </div>
            <ul aria-label="Exemplos" className="flex flex-wrap gap-2">
              {EXEMPLOS.map((exemplo) => (
                <li key={exemplo}>
                  <Link
                    href={hrefPergunta(exemplo)}
                    onClick={(e) => {
                      e.preventDefault();
                      perguntar(exemplo);
                    }}
                    className="inline-flex h-9 items-center rounded-full border border-white/20 px-3.5 text-sm text-white/80 transition-colors hover:border-laranja hover:text-white"
                  >
                    {exemplo}
                  </Link>
                </li>
              ))}
            </ul>
          </form>

          <Link
            href="/catalogo"
            className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-white/80 hover:text-white"
          >
            Já sei o que quero: ver equipamentos
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="relative -mx-4 h-[19rem] sm:h-[26rem] md:mx-0 md:h-[36rem]">
          <div
            aria-hidden
            className="absolute inset-x-[12%] bottom-[8%] top-[18%] -z-10 rounded-full bg-laranja/20 blur-3xl"
          />
          <Betoneira3D className="size-full" />
        </div>
      </div>
    </section>
  );
}
