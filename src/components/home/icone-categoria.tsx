"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Ícones de ferramenta das categorias da home. Cada um "liga" ao passar o
// mouse no cartão (o CSS cuida disso em .group:hover) e, sem mouse, por
// alguns segundos quando aparece na tela. As animações ficam em globals.css.

type Ferramenta =
  | "furadeira"
  | "martelete"
  | "serra"
  | "betoneira"
  | "compactador"
  | "andaime"
  | "carrinho"
  | "gerador"
  | "lavadora"
  | "lixadeira"
  | "chave";

// As categorias são texto livre da loja: casa por palavra-chave, sem acento.
const PALAVRAS: [RegExp, Ferramenta][] = [
  [/perfur|furad|broca/, "furadeira"],
  [/demol|quebr|rompedor|martel/, "martelete"],
  [/corte|cortar|serra/, "serra"],
  [/concret|betoneira|massa|argamassa/, "betoneira"],
  [/compact|sapo|placa vibrat/, "compactador"],
  [/acesso|altura|andaime|escada/, "andaime"],
  [/transporte|carrinho|carga/, "carrinho"],
  [/energia|gerador|eletric/, "gerador"],
  [/limpeza|lavadora|lavar|aspira/, "lavadora"],
  [/acabamento|lixa|polir|pintura/, "lixadeira"],
];

export function ferramentaDaCategoria(categoria: string): Ferramenta {
  const nome = categoria.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  return PALAVRAS.find(([re]) => re.test(nome))?.[1] ?? "chave";
}

const DESENHOS: Record<Ferramenta, ReactNode> = {
  furadeira: (
    <>
      <g className="anima-treme-x">
        <path d="M30 18h12" />
        <path className="anima-broca" d="M32 15.5l2 5M35 15.5l2 5M38 15.5l2 5" strokeWidth="1.6" />
      </g>
      <rect x="7" y="11" width="21" height="13" rx="3.5" className="preenche" />
      <path d="M28 15h3v6h-3" />
      <path d="M13 24l-1.5 13h7.5l1.5-13" className="preenche" />
      <path d="M11 30h8" />
    </>
  ),
  martelete: (
    <>
      <g className="anima-treme-y">
        <path d="M16 6h16" />
        <path d="M20 6v4M28 6v4" />
        <rect x="17" y="10" width="14" height="17" rx="3" className="preenche" />
        <path d="M22 27v6h4v-6" />
        <path d="M24 33v8" strokeWidth="3" />
      </g>
      <path d="M12 43h24" />
      <path className="anima-lascas" d="M17 40l-3-3M31 40l3-3M15 43l-4 0" strokeWidth="1.8" />
    </>
  ),
  serra: (
    <>
      <g className="anima-giro">
        <circle cx="24" cy="26" r="13" className="preenche" />
        <path d="M24 11l2 3M37 22l-3 1.5M35 36l-2.5-2M24 41l-1-3.4M13 36l2.5-2M11 22l3 1.5M17 13.5l2 2.6M31 13.5l-2 2.6" />
        <circle cx="24" cy="26" r="3.2" />
        <path d="M24 17v4M24 31v4" strokeWidth="1.6" />
      </g>
      <path d="M10 22a15 15 0 0 1 28 0" strokeWidth="3.2" />
    </>
  ),
  betoneira: (
    <>
      <g className="anima-giro">
        <circle cx="22" cy="21" r="11" className="preenche" />
        <path d="M14 15l16 12M12.5 22.5l14 9M17.5 11.5l15 11" strokeWidth="1.8" />
      </g>
      <path d="M22 32v5M10 37h26M33 37l3-6" />
      <circle cx="13" cy="41" r="2.6" />
      <circle cx="33" cy="41" r="2.6" />
    </>
  ),
  compactador: (
    <>
      <g className="anima-pula">
        <path d="M20 6h8M24 6v7" />
        <rect x="16" y="13" width="16" height="14" rx="3" className="preenche" />
        <path d="M14 32h20l-2-5H16z" />
      </g>
      <path d="M8 41h32" />
      <path className="anima-poeira" d="M12 38c1.5-1.2 3-1.2 4.5 0M31.5 38c1.5-1.2 3-1.2 4.5 0" strokeWidth="1.6" />
    </>
  ),
  andaime: (
    <>
      <path d="M12 42V8M36 42V8M12 16h24M12 42l24-26M12 16l24 26" strokeWidth="1.8" />
      <g className="anima-sobe">
        <rect x="9" y="27" width="30" height="5" rx="1.5" className="preenche" />
        <path d="M20 27v-6M28 27v-6M20 21h8" strokeWidth="1.8" />
      </g>
    </>
  ),
  carrinho: (
    <g className="anima-anda">
      <path d="M6 16h22l-4 13H10z" className="preenche" />
      <path d="M24 29l10 4M28 16l12-5" />
      <g className="anima-giro">
        <circle cx="34" cy="35" r="5" />
        <path d="M34 30v10M29 35h10" strokeWidth="1.6" />
      </g>
      <path d="M12 29l-2 10" />
    </g>
  ),
  gerador: (
    <>
      <rect x="7" y="14" width="34" height="22" rx="3" className="preenche" />
      <path d="M11 36v5M37 36v5M7 20h34" />
      <path className="anima-pisca" d="M25 22l-5 8h5l-2 6 6-9h-5l2-5z" strokeWidth="1.8" />
    </>
  ),
  lavadora: (
    <>
      <path d="M8 18h14l4-4h8M34 14l7 7" />
      <rect x="8" y="18" width="14" height="10" rx="2.5" className="preenche" />
      <path d="M12 28l-2 10M18 28l2 10" />
      <g className="anima-gotas" strokeWidth="2">
        <path d="M40 25v3M43 30v3M38 32v3" />
      </g>
    </>
  ),
  lixadeira: (
    <>
      <g className="anima-orbita">
        <path d="M16 14c0-4 3-6 8-6s8 2 8 6v6H16z" className="preenche" />
        <rect x="11" y="20" width="26" height="9" rx="2.5" className="preenche" />
        <path d="M11 32h26" strokeWidth="3" />
      </g>
      <path className="anima-poeira" d="M8 40h6M20 41h8M34 40h6" strokeWidth="1.6" />
    </>
  ),
  chave: (
    <g className="anima-chacoalha">
      <path
        d="M30 7a8 8 0 0 0-7 11L9 32a3.5 3.5 0 0 0 5 5l14-14a8 8 0 0 0 11-7l-5 2-4-4 2-5z"
        className="preenche"
      />
    </g>
  ),
};

export function IconeCategoria({ categoria }: { categoria: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  // Sem mouse, a ferramenta liga por um instante quando o cartão aparece.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let desliga = 0;
    const observador = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.ligado = "";
        window.clearTimeout(desliga);
        desliga = window.setTimeout(() => delete el.dataset.ligado, 2400);
      },
      { threshold: 0.8 },
    );
    observador.observe(el);
    return () => {
      observador.disconnect();
      window.clearTimeout(desliga);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      className="icone-ferramenta flex size-14 shrink-0 items-center justify-center rounded-xl bg-concreto text-laranja transition-colors duration-300 group-hover:bg-laranja/15"
    >
      <svg
        viewBox="0 0 48 48"
        className="size-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {DESENHOS[ferramentaDaCategoria(categoria)]}
      </svg>
    </span>
  );
}
