"use client";

import { useEffect, useRef, useState } from "react";
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
  const secaoRef = useRef<HTMLElement>(null);
  const luzRef = useRef<HTMLDivElement>(null);
  const betoneiraRef = useRef<HTMLDivElement>(null);

  // Brilho laranja que segue o mouse pela seção e, quando ele sai, volta
  // para trás da betoneira. Sem mouse (toque), fica parado atrás dela.
  useEffect(() => {
    const secao = secaoRef.current;
    const luz = luzRef.current;
    const betoneira = betoneiraRef.current;
    if (!secao || !luz || !betoneira) return;
    const comMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const descanso = () => {
      const s = secao.getBoundingClientRect();
      const b = betoneira.getBoundingClientRect();
      return { x: b.left - s.left + b.width / 2, y: b.top - s.top + b.height * 0.55 };
    };
    let atual = descanso();
    let alvo = atual;
    let quadro = 0;
    let ultimo = 0;
    let dentro = false;

    const aplicar = () => {
      luz.style.transform = `translate(${atual.x}px, ${atual.y}px) translate(-50%, -50%)`;
      secao.style.setProperty("--luz-x", `${atual.x}px`);
      secao.style.setProperty("--luz-y", `${atual.y}px`);
    };
    const desenhar = (agora: number) => {
      quadro = 0;
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 1 / 60;
      ultimo = agora;
      // Dentro, gruda no mouse com um mínimo de suavidade; ao sair, volta devagar.
      const k = reduzir ? 1 : Math.min(1, dt * (dentro ? 24 : 3));
      atual = { x: atual.x + (alvo.x - atual.x) * k, y: atual.y + (alvo.y - atual.y) * k };
      aplicar();
      if (Math.hypot(alvo.x - atual.x, alvo.y - atual.y) > 0.5) quadro = requestAnimationFrame(desenhar);
      else ultimo = 0;
    };
    const pedir = () => {
      if (!quadro) quadro = requestAnimationFrame(desenhar);
    };

    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const s = secao.getBoundingClientRect();
      dentro = true;
      alvo = { x: e.clientX - s.left, y: e.clientY - s.top };
      pedir();
    };
    const sair = () => {
      dentro = false;
      alvo = descanso();
      pedir();
    };
    const redimensionar = () => {
      if (dentro) return;
      atual = alvo = descanso();
      aplicar();
    };

    aplicar();
    luz.classList.replace("opacity-0", "opacity-100");
    window.addEventListener("resize", redimensionar);
    if (comMouse) {
      secao.addEventListener("pointermove", mover);
      secao.addEventListener("pointerleave", sair);
    }
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("resize", redimensionar);
      secao.removeEventListener("pointermove", mover);
      secao.removeEventListener("pointerleave", sair);
    };
  }, []);

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
    <section ref={secaoRef} className="chao-terra relative isolate overflow-hidden">
      {/* Grade de prumo ao fundo, como a planta riscada no canteiro. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_45%,#000_20%,transparent_75%)]"
      />
      {/* Brilho: miolo forte e definido, borda que cai suave. Desbota perto do
          topo e do fim da seção para não ser cortado numa linha reta. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,#000_12%,#000_72%,transparent)]"
      >
        <div
          ref={luzRef}
          className="absolute top-0 left-0 size-[26rem] rounded-full bg-[radial-gradient(circle,rgb(241_147_60/0.42)_0%,rgb(241_147_60/0.24)_14%,rgb(241_147_60/0.1)_34%,rgb(241_147_60/0.03)_52%,transparent_70%)] opacity-0 transition-opacity duration-700 md:size-[34rem]"
        />
      </div>
      {/* A mesma grade em laranja, acesa só em volta do brilho e sumindo no topo e no fim. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(rgb(241_147_60/0.5)_1px,transparent_1px),linear-gradient(90deg,rgb(241_147_60/0.5)_1px,transparent_1px)] [background-size:56px_56px] [mask-composite:intersect] [mask-image:radial-gradient(circle_13rem_at_var(--luz-x,-50rem)_var(--luz-y,-50rem),#000_0%,rgb(0_0_0/0.5)_45%,transparent_100%),linear-gradient(to_bottom,transparent,#000_18%,#000_78%,transparent)]"
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

        <div ref={betoneiraRef} className="relative -mx-4 h-[19rem] sm:h-[26rem] md:mx-0 md:h-[36rem]">
          <Betoneira3D className="size-full" />
        </div>
      </div>
    </section>
  );
}
