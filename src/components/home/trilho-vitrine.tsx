"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const VELOCIDADE = 45; // px/s da esteira andando sozinha

/**
 * Esteira da vitrine: os cartões passam sem parar, em laço infinito (a lista
 * é repetida o bastante para cobrir a tela). Arrasta com o dedo ou o mouse:
 * ao soltar, segue no sentido do arremesso e desacelera até a velocidade
 * normal, nesse mesmo sentido. Com "reduzir movimento", só anda quando arrastada.
 */
export function TrilhoVitrine({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  const janelaRef = useRef<HTMLDivElement>(null);
  const faixaRef = useRef<HTMLDivElement>(null);
  const [copias, setCopias] = useState(2);
  const empurrar = useRef<(px: number) => void>(() => {});

  useEffect(() => {
    const janela = janelaRef.current;
    const faixa = faixaRef.current;
    if (!janela || !faixa) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let deslocamento = 0;
    let sentido = 1; // 1: cartões vão para a esquerda
    let impulso = 0; // px/s somados à velocidade normal, que se apagam com o tempo
    let empurrao = 0; // px que as setas ainda vão andar
    let ultimo = 0;
    let quadro = 0;
    let visivel = true;
    let focado = false;
    let arrasto: { x: number; inicio: number; ultimoX: number; ultimoT: number; vel: number; moveu: boolean } | null = null;

    // Largura de uma volta: distância entre o começo de uma cópia e o da seguinte.
    const volta = () => {
      const [a, b] = faixa.children as HTMLCollectionOf<HTMLElement>;
      return a && b ? b.offsetLeft - a.offsetLeft : 0;
    };
    const medir = () => {
      const largura = volta();
      if (largura > 0) setCopias(Math.max(2, Math.ceil(janela.clientWidth / largura) + 1));
    };
    const observadorTamanho = new ResizeObserver(medir);
    observadorTamanho.observe(janela);

    function desenhar(agora: number) {
      quadro = 0;
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 0;
      ultimo = agora;
      if (!arrasto) {
        const normal = reduzir || focado ? 0 : VELOCIDADE * sentido;
        deslocamento += (normal + impulso) * dt;
        impulso *= Math.pow(0.04, dt);
        if (Math.abs(impulso) < 1) impulso = 0;
        const passo = empurrao * Math.min(1, dt * 7);
        deslocamento += passo;
        empurrao -= passo;
        if (Math.abs(empurrao) < 0.5) empurrao = 0;
      }
      const largura = volta();
      if (largura > 0) deslocamento = ((deslocamento % largura) + largura) % largura;
      faixa!.style.transform = `translate3d(${-deslocamento}px, 0, 0)`;
      const andando = !reduzir || impulso !== 0 || empurrao !== 0 || arrasto;
      if (visivel && andando) pedirQuadro();
      else ultimo = 0;
    }
    function pedirQuadro() {
      if (!quadro) quadro = requestAnimationFrame(desenhar);
    }

    empurrar.current = (px) => {
      empurrao += px;
      pedirQuadro();
    };

    const apertar = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      arrasto = { x: e.clientX, inicio: deslocamento, ultimoX: e.clientX, ultimoT: e.timeStamp, vel: 0, moveu: false };
      impulso = 0;
      empurrao = 0;
    };
    const mover = (e: PointerEvent) => {
      if (!arrasto) return;
      const dx = e.clientX - arrasto.x;
      if (!arrasto.moveu) {
        if (Math.abs(dx) < 6) return;
        arrasto.moveu = true;
        janela.setPointerCapture(e.pointerId);
        janela.style.cursor = "grabbing";
      }
      const dtMs = Math.max(1, e.timeStamp - arrasto.ultimoT);
      // Velocidade do dedo (px/s), suavizada para o arremesso não depender do último pixel.
      const vel = (-(e.clientX - arrasto.ultimoX) / dtMs) * 1000;
      arrasto.vel = arrasto.vel * 0.6 + vel * 0.4;
      arrasto.ultimoX = e.clientX;
      arrasto.ultimoT = e.timeStamp;
      deslocamento = arrasto.inicio - dx;
      pedirQuadro();
    };
    const soltar = (e: PointerEvent) => {
      if (!arrasto) return;
      const { moveu, ultimoT } = arrasto;
      const puxado = deslocamento - arrasto.inicio;
      // Dedo parado antes de soltar: sem arremesso.
      const vel = e.timeStamp - ultimoT > 80 ? 0 : Math.max(-2500, Math.min(2500, arrasto.vel));
      arrasto = null;
      janela.style.cursor = "";
      if (!moveu) return;
      // A esteira segue para o lado em que foi jogada ou, sem arremesso, puxada.
      if (Math.abs(vel) > 60) sentido = Math.sign(vel);
      else if (Math.abs(puxado) > 40) sentido = Math.sign(puxado);
      impulso = vel - (reduzir ? 0 : VELOCIDADE * sentido);
      // O clique que viria do fim do arrasto não abre o cartão.
      const engolir = (ev: MouseEvent) => ev.preventDefault();
      janela.addEventListener("click", engolir, { capture: true, once: true });
      window.setTimeout(() => janela.removeEventListener("click", engolir, { capture: true }), 0);
      pedirQuadro();
    };
    const naoArrastarImagem = (e: DragEvent) => e.preventDefault();
    // Quem navega pelo teclado precisa do cartão parado para ler.
    const aoFocar = (e: FocusEvent) => {
      focado = (e.target as HTMLElement).matches(":focus-visible");
    };
    const aoDesfocar = () => {
      focado = false;
      pedirQuadro();
    };
    janela.addEventListener("pointerdown", apertar);
    janela.addEventListener("pointermove", mover);
    janela.addEventListener("pointerup", soltar);
    janela.addEventListener("pointercancel", soltar);
    janela.addEventListener("dragstart", naoArrastarImagem);
    janela.addEventListener("focusin", aoFocar);
    janela.addEventListener("focusout", aoDesfocar);

    const observadorTela = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel) pedirQuadro();
    });
    observadorTela.observe(janela);
    pedirQuadro();

    return () => {
      cancelAnimationFrame(quadro);
      observadorTamanho.disconnect();
      observadorTela.disconnect();
      janela.removeEventListener("pointerdown", apertar);
      janela.removeEventListener("pointermove", mover);
      janela.removeEventListener("pointerup", soltar);
      janela.removeEventListener("pointercancel", soltar);
      janela.removeEventListener("dragstart", naoArrastarImagem);
      janela.removeEventListener("focusin", aoFocar);
      janela.removeEventListener("focusout", aoDesfocar);
    };
  }, []);

  function andar(sentido: 1 | -1) {
    const primeiro = faixaRef.current?.querySelector("li");
    empurrar.current(sentido * ((primeiro?.offsetWidth ?? 300) + 16));
  }

  const seta =
    "hidden size-11 items-center justify-center rounded-full bg-card ring-1 ring-foreground/15 transition-colors hover:bg-laranja hover:text-terra md:flex";

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={janelaRef}
        className="mx-[calc(50%-50vw)] cursor-grab touch-pan-y overflow-hidden py-2 select-none [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)] [&_a]:[-webkit-user-drag:none] [&_img]:pointer-events-none"
      >
        <div ref={faixaRef} className="flex w-max gap-4 will-change-transform">
          {Array.from({ length: copias }, (_, i) => (
            <ul
              key={i}
              aria-label={i === 0 ? rotulo : undefined}
              aria-hidden={i > 0 || undefined}
              inert={i > 0}
              className="flex shrink-0 gap-4"
            >
              {children}
            </ul>
          ))}
        </div>
      </div>
      <div className="flex gap-2 self-end">
        <button type="button" aria-label="Ver anteriores" className={seta} onClick={() => andar(-1)}>
          <ArrowLeft aria-hidden className="size-4" />
        </button>
        <button type="button" aria-label="Ver mais" className={seta} onClick={() => andar(1)}>
          <ArrowRight aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
