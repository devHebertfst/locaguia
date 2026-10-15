"use client";

import { useEffect, useRef } from "react";

type Passo = { titulo: string; texto: string };

const limitar = (v: number) => Math.min(1, Math.max(0, v));
const suave = (de: number, ate: number, v: number) => {
  const t = limitar((v - de) / (ate - de));
  return t * t * (3 - 2 * t);
};

/**
 * Passos da home presos com parafuso: os números são cabeças de parafuso e,
 * ao rolar, uma parafusadeira desce e aperta um por vez; o texto do passo
 * aparece quando o parafuso assenta. Rolando para cima, desaperta. Sem
 * movimento, tudo já aparece apertado e sem a parafusadeira.
 */
export function PassosParafusados({ passos }: { passos: Passo[] }) {
  const listaRef = useRef<HTMLOListElement>(null);
  const ferramentaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lista = listaRef.current;
    const ferramenta = ferramentaRef.current;
    if (!lista || !ferramenta) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parafusos = Array.from(lista.querySelectorAll<HTMLElement>("[data-parafuso]"));
    const textos = Array.from(lista.querySelectorAll<HTMLElement>("[data-texto]"));
    ferramenta.hidden = false;
    let quadro = 0;
    let ultimo = 0;
    let visivel = false;
    let anteriores: number[] = [];
    let pos: { x: number; y: number } | null = null;
    let opacidade = 0;
    let rapidez = 0;

    function desenhar(agora: number) {
      quadro = 0;
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 1 / 60;
      ultimo = agora;
      const vh = window.innerHeight;
      const caixaLista = lista!.getBoundingClientRect();

      // Cada parafuso aperta enquanto seu centro sobe de 80% a 55% da tela.
      const progressos = parafusos.map((p) => {
        const r = p.getBoundingClientRect();
        return limitar((vh * 0.8 - (r.top + r.height / 2)) / (vh * 0.25));
      });
      const andou = progressos.reduce((s, p, i) => s + Math.abs(p - (anteriores[i] ?? p)), 0);
      anteriores = progressos;
      rapidez += (Math.min(1, (andou / dt) * 3) - rapidez) * Math.min(1, dt * 10);

      progressos.forEach((p, i) => {
        const cabeca = parafusos[i].firstElementChild as HTMLElement;
        // Duas voltas inteiras: termina com o número de pé.
        cabeca.style.transform = `rotate(${(p - 1) * 720}deg) scale(${1.22 - 0.22 * suave(0, 1, p)})`;
        cabeca.style.filter = `drop-shadow(0 ${10 - 8 * p}px ${12 - 8 * p}px rgb(0 0 0 / ${0.55 - 0.25 * p}))`;
        const texto = suave(0.55, 1, p);
        textos[i].style.opacity = String(0.15 + 0.85 * texto);
        textos[i].style.transform = `translateX(${(1 - texto) * 14}px)`;
      });

      // A parafusadeira fica no próximo parafuso a apertar; quando todos assentam, sobe e some.
      const alvo = progressos.findIndex((p) => p < 1);
      const atual = alvo === -1 ? parafusos.length - 1 : alvo;
      const r = parafusos[atual].getBoundingClientRect();
      const encostada = alvo !== -1 && progressos[atual] > 0;
      const destino = {
        x: r.left - caixaLista.left + r.width / 2,
        y: r.top - caixaLista.top + r.height / 2 - (alvo === -1 ? 60 : encostada ? 0 : 22),
      };
      pos = pos
        ? { x: pos.x + (destino.x - pos.x) * Math.min(1, dt * 9), y: pos.y + (destino.y - pos.y) * Math.min(1, dt * 9) }
        : destino;
      const primeiro = parafusos[0].getBoundingClientRect();
      const mostrar = alvo !== -1 && primeiro.top < vh * 0.95;
      opacidade += ((mostrar ? 1 : 0) - opacidade) * Math.min(1, dt * 6);
      const girando = encostada && rapidez > 0.05;
      const tremor = girando ? (Math.random() - 0.5) * 1.6 : 0;
      ferramenta!.style.opacity = opacidade.toFixed(3);
      ferramenta!.style.transform = `translate(${pos.x + tremor}px, ${pos.y}px)`;
      ferramenta!.toggleAttribute("data-girando", girando);

      if (visivel || opacidade > 0.01) pedirQuadro();
      else ultimo = 0;
    }
    function pedirQuadro() {
      if (!quadro) quadro = requestAnimationFrame(desenhar);
    }

    const observador = new IntersectionObserver(
      ([e]) => {
        visivel = e.isIntersecting;
        if (visivel) pedirQuadro();
      },
      { rootMargin: "20% 0px" },
    );
    observador.observe(lista);
    pedirQuadro();
    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
    };
  }, []);

  return (
    <ol ref={listaRef} className="relative flex flex-col">
      {passos.map((passo, i) => (
        <li
          key={passo.titulo}
          className="grid grid-cols-[3.5rem_1fr] items-start gap-x-5 border-t border-foreground/12 py-7 first:border-t-0 first:pt-0 sm:grid-cols-[5rem_1fr]"
        >
          <span data-parafuso aria-hidden className="relative size-14 sm:size-16">
            <span className="block size-full will-change-transform">
              <CabecaDeParafuso numero={i + 1} />
            </span>
          </span>
          <div data-texto className="flex flex-col gap-1.5 will-change-transform">
            <h3 className="text-2xl font-semibold">
              <span className="sr-only">Passo {i + 1}: </span>
              {passo.titulo}
            </h3>
            <p className="max-w-[52ch] text-muted-foreground">{passo.texto}</p>
          </div>
        </li>
      ))}
      <div
        ref={ferramentaRef}
        aria-hidden
        hidden
        className="parafusadeira pointer-events-none absolute top-0 left-0 z-10 opacity-0"
      >
        <Parafusadeira />
      </div>
    </ol>
  );
}

function CabecaDeParafuso({ numero }: { numero: number }) {
  return (
    <svg viewBox="0 0 64 64" className="size-full">
      <defs>
        <radialGradient id={`aco-parafuso-${numero}`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ece8e3" />
          <stop offset="0.6" stopColor="#aaa49e" />
          <stop offset="1" stopColor="#6c6762" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill={`url(#aco-parafuso-${numero})`} stroke="#4d4843" strokeWidth="2" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1.2" />
      {/* Sextavado interno, com o número do passo dentro. */}
      <polygon points="32,15 46.7,23.5 46.7,40.5 32,49 17.3,40.5 17.3,23.5" fill="#2a231d" stroke="#1a1512" strokeWidth="1.5" />
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#f1933c"
        fontSize="24"
        fontWeight="700"
        style={{ fontFamily: "var(--font-cabin)" }}
      >
        {numero}
      </text>
    </svg>
  );
}

// Parafusadeira de bateria vista de lado, apontando para baixo; a ponta da
// broca fica no ponto (0, 0) do elemento, que é posicionado no centro do parafuso.
function Parafusadeira() {
  return (
    <svg
      viewBox="0 0 90 140"
      className="absolute top-0 left-0 w-[4.5rem] overflow-visible drop-shadow-[0_14px_18px_rgb(0_0_0/0.5)] sm:w-[5.5rem]"
      style={{ transform: "translate(-48%, -100%)" }}
    >
      <defs>
        <clipPath id="recorte-bit">
          <rect x="40" y="92" width="6" height="40" />
        </clipPath>
      </defs>
      <g className="parafusadeira-corpo">
        {/* Bateria e cabo, saindo para a direita. */}
        <path d="M52 46 L74 70 L66 78 L46 58 Z" fill="#443f3b" stroke="#241d17" strokeWidth="2" strokeLinejoin="round" />
        <rect x="62" y="70" width="24" height="16" rx="4" transform="rotate(45 74 78)" fill="#2b2520" stroke="#241d17" strokeWidth="2" />
        {/* Corpo laranja com o motor. */}
        <rect x="24" y="8" width="38" height="66" rx="13" fill="#f1933c" stroke="#a9550a" strokeWidth="2.5" />
        <path d="M33 18h20M33 24h20M33 30h20" stroke="#a9550a" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="30" y="44" width="26" height="12" rx="3" fill="#241d17" opacity="0.85" />
        <text x="43" y="52.5" textAnchor="middle" fill="#f1933c" fontSize="7" fontWeight="700" letterSpacing="0.6" style={{ fontFamily: "var(--font-cabin)" }}>
          LOCAGUIA
        </text>
        {/* Mandril. */}
        <rect x="33" y="74" width="20" height="18" rx="4" fill="#3b3733" stroke="#241d17" strokeWidth="2" />
        <path d="M37 76v14M43 76v14M49 76v14" stroke="#6f6a65" strokeWidth="1.5" />
      </g>
      {/* Bit: as faixas descem quando gira. */}
      <g>
        <rect x="40" y="92" width="6" height="40" fill="#b9b3ad" stroke="#5f5a55" strokeWidth="1.2" />
        <g clipPath="url(#recorte-bit)">
          <g className="parafusadeira-bit" stroke="#6f6a65" strokeWidth="1.4">
            <path d="M40 90l6 3M40 96l6 3M40 102l6 3M40 108l6 3M40 114l6 3M40 120l6 3M40 126l6 3" />
          </g>
        </g>
        <path d="M40 132 L43 140 L46 132 Z" fill="#8a8580" stroke="#5f5a55" strokeWidth="1" />
      </g>
    </svg>
  );
}
