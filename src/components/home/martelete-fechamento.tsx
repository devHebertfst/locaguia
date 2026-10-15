"use client";

import { useEffect, useRef } from "react";

// Batidas ao aparecer: rajadas curtas com pausa, como quem está quebrando piso.
const RAJADAS = [650, 500, 800]; // ms de cada rajada
const PAUSA = 380;

/**
 * Martelete da faixa laranja do fim da home: quando a faixa aparece, dá
 * algumas rajadas de batidas no chão, soltando lascas e abrindo trincas.
 * Passar o mouse na faixa faz bater de novo. Sem movimento, fica parado.
 */
export function MarteleteFechamento() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const faixa = el.closest("section") ?? el;
    let timers: number[] = [];
    let ocupado = false;

    const bater = () => {
      if (ocupado) return;
      ocupado = true;
      let t = 0;
      RAJADAS.forEach((duracao, i) => {
        timers.push(window.setTimeout(() => (el.dataset.batendo = ""), t));
        t += duracao;
        timers.push(
          window.setTimeout(() => {
            delete el.dataset.batendo;
            el.dataset.trincado = "";
            if (i === RAJADAS.length - 1) ocupado = false;
          }, t),
        );
        t += PAUSA;
      });
    };

    const observador = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) bater();
      },
      { threshold: 0.6 },
    );
    observador.observe(el);
    faixa.addEventListener("pointerenter", bater);
    return () => {
      observador.disconnect();
      faixa.removeEventListener("pointerenter", bater);
      timers.forEach(clearTimeout);
      timers = [];
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="martelete pointer-events-none relative h-28 w-20 shrink-0 self-end sm:h-32 sm:w-24">
      <svg viewBox="0 0 90 130" className="size-full overflow-visible">
        {/* Trincas no chão, que aparecem depois da primeira rajada. */}
        <g className="martelete-trincas" fill="none" stroke="#241d17" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M45 124 L36 127 L28 125 L20 129" />
          <path d="M45 124 L55 128 L63 126 L72 129" />
          <path d="M45 124 L47 129" />
        </g>
        <path d="M6 124 H84" stroke="#241d17" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />

        <g className="martelete-corpo">
          {/* Cabo em T. */}
          <path d="M14 14 H76" stroke="#241d17" strokeWidth="9" strokeLinecap="round" />
          <path d="M14 14 H26 M64 14 H76" stroke="#443f3b" strokeWidth="9" strokeLinecap="round" />
          <path d="M37 14 V26 M53 14 V26" stroke="#241d17" strokeWidth="5" />
          {/* Corpo com motor. */}
          <rect x="29" y="24" width="32" height="58" rx="8" fill="#241d17" />
          <rect x="29" y="44" width="32" height="7" fill="#a9550a" />
          <path d="M35 30h20M35 36h20" stroke="#443f3b" strokeWidth="2.5" strokeLinecap="round" />
          <text x="45" y="68" textAnchor="middle" fill="#f1933c" fontSize="7.5" fontWeight="700" letterSpacing="0.5" style={{ fontFamily: "var(--font-cabin)" }}>
            LOCAGUIA
          </text>
          {/* Talhadeira. */}
          <rect x="38" y="82" width="14" height="10" rx="2" fill="#443f3b" />
          <path d="M41 92 H49 V116 L45 124 L41 116 Z" fill="#c9c4be" stroke="#5f5a55" strokeWidth="1.2" strokeLinejoin="round" />
        </g>

        {/* Lascas que voam a cada batida. */}
        <g className="martelete-lascas" fill="#241d17">
          <path d="M40 121 l-3 -2 l-1 3 z" />
          <path d="M50 121 l3 -2 l1 3 z" />
          <rect x="43" y="119" width="3" height="3" rx="0.6" />
          <path d="M36 123 l-2 -1 l0 2.5 z" />
        </g>
      </svg>
    </div>
  );
}
