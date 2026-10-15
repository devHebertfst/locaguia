"use client";

import { useEffect, useRef } from "react";

const FRASE = (
  <>
    Máquina boa
    <br />
    é a que trabalha.
  </>
);

type Particula = { x: number; y: number; vx: number; vy: number; vida: number; total: number; faisca: boolean };

const limitar = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Frase da obra cortada por uma serra: as letras começam só com o contorno
 * e, conforme a página rola, um disco de serra atravessa a frase da esquerda
 * para a direita; por onde passa, elas saem cortadas em concreto, com faíscas
 * e pó. Rolando para cima, volta. Sem movimento, a frase já aparece cortada.
 */
export function FraseConcreto() {
  const secaoRef = useRef<HTMLElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const serraRef = useRef<HTMLDivElement>(null);
  const discoRef = useRef<SVGGElement>(null);
  const corteRef = useRef<HTMLDivElement>(null);
  const telaRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const secao = secaoRef.current;
    const titulo = tituloRef.current;
    const serra = serraRef.current;
    const disco = discoRef.current;
    const corte = corteRef.current;
    const tela = telaRef.current;
    const ctx = tela?.getContext("2d");
    if (!secao || !titulo || !serra || !disco || !corte || !tela || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    serra.hidden = false;
    let quadro = 0;
    let ultimo = 0;
    let visivel = false;
    let angulo = 0;
    let progressoAnterior = -1;
    let rapidez = 0; // quanto a serra está andando agora (suavizado)
    const particulas: Particula[] = [];

    // 0 quando o meio da frase está a 85% da altura da tela; 1 quando chega a 35%.
    const progresso = () => {
      const r = titulo.getBoundingClientRect();
      const vh = window.innerHeight;
      return limitar((vh * 0.85 - (r.top + r.height / 2)) / (vh * 0.5));
    };

    function ajustarTela() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = Math.round(secao!.clientWidth * dpr);
      const h = Math.round(secao!.clientHeight * dpr);
      if (tela!.width !== w || tela!.height !== h) {
        tela!.width = w;
        tela!.height = h;
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function desenhar(agora: number) {
      quadro = 0;
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 1 / 60;
      ultimo = agora;

      const p = progresso();
      const passo = progressoAnterior < 0 ? 0 : p - progressoAnterior;
      progressoAnterior = p;
      rapidez += (Math.min(1, Math.abs(passo / dt) * 2.5) - rapidez) * Math.min(1, dt * 10);

      titulo!.style.setProperty("--corte", `${(p * 100).toFixed(2)}%`);

      // Serra: o centro do disco fica na linha de corte, no meio da altura da frase.
      const largura = titulo!.offsetWidth;
      const altura = titulo!.offsetHeight;
      const diametro = Math.min(altura * 0.95, 340);
      const x = titulo!.offsetLeft + largura * p;
      const y = titulo!.offsetTop + altura / 2;
      // O desenho tem folga em volta do disco (capa e cabo): o disco ocupa 196 de 300.
      const tamanho = (diametro * 300) / 196;
      serra!.style.width = serra!.style.height = `${tamanho}px`;
      serra!.style.transform = `translate(${x - tamanho / 2}px, ${y - tamanho / 2}px)`;
      // Gira sempre (motor ligado) e mais rápido quando está cortando.
      angulo = (angulo + (540 + rapidez * 1800) * dt) % 360;
      disco!.setAttribute("transform", `rotate(${angulo})`);

      corte!.style.transform = `translateX(${x}px)`;
      corte!.style.opacity = String(p > 0.002 && p < 0.998 ? 0.35 + rapidez * 0.65 : 0);

      // Faíscas e pó saem por baixo, para trás: no disco girando no sentido do
      // relógio, os dentes de baixo correm para a esquerda.
      const cortando = p > 0.002 && p < 0.998;
      const sr = secao!.getBoundingClientRect();
      const tr = titulo!.getBoundingClientRect();
      const ox = tr.left - sr.left - titulo!.offsetLeft;
      const oy = tr.top - sr.top - titulo!.offsetTop;
      if (cortando && rapidez > 0.05) {
        const raio = diametro / 2;
        const novas = Math.round(rapidez * 7);
        for (let i = 0; i < novas; i++) {
          const a = Math.PI * (0.55 + Math.random() * 0.25);
          const faisca = Math.random() < 0.7;
          const vel = faisca ? 380 + Math.random() * 520 : 40 + Math.random() * 80;
          const vida = faisca ? 0.25 + Math.random() * 0.35 : 0.7 + Math.random() * 0.6;
          particulas.push({
            x: ox + x + Math.cos(a) * raio * 0.96,
            y: oy + y + Math.sin(a) * raio * 0.96,
            vx: faisca ? -vel * (0.7 + Math.random() * 0.5) : (Math.random() - 0.8) * vel,
            vy: faisca ? vel * (Math.random() - 0.15) * 0.6 : -vel * (0.3 + Math.random()),
            vida,
            total: vida,
            faisca,
          });
        }
      }

      ajustarTela();
      ctx!.clearRect(0, 0, secao!.clientWidth, secao!.clientHeight);
      for (let i = particulas.length - 1; i >= 0; i--) {
        const q = particulas[i];
        q.vida -= dt;
        if (q.vida <= 0) {
          particulas.splice(i, 1);
          continue;
        }
        const t = q.vida / q.total;
        if (q.faisca) {
          q.vy += 900 * dt;
          ctx!.globalCompositeOperation = "lighter";
          ctx!.strokeStyle = `rgb(255 ${170 + Math.round(70 * t)} ${60 + Math.round(90 * t)} / ${t})`;
          ctx!.lineWidth = 1.6;
          ctx!.beginPath();
          ctx!.moveTo(q.x, q.y);
          ctx!.lineTo(q.x - q.vx * 0.025, q.y - q.vy * 0.025);
          ctx!.stroke();
        } else {
          q.vx *= 1 - dt * 1.5;
          q.vy *= 1 - dt * 1.5;
          ctx!.globalCompositeOperation = "source-over";
          ctx!.fillStyle = `rgb(190 182 172 / ${t * 0.35})`;
          ctx!.beginPath();
          ctx!.arc(q.x, q.y, 2 + (1 - t) * 6, 0, Math.PI * 2);
          ctx!.fill();
        }
        q.x += q.vx * dt;
        q.y += q.vy * dt;
      }
      ctx!.globalCompositeOperation = "source-over";

      if (visivel || particulas.length > 0) pedirQuadro();
      else ultimo = 0;
    }

    function pedirQuadro() {
      if (!quadro) quadro = requestAnimationFrame(desenhar);
    }

    const observador = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel) pedirQuadro();
    });
    observador.observe(secao);
    // Um quadro já na montagem: a frase começa só no contorno, sem piscar cortada.
    pedirQuadro();

    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
    };
  }, []);

  return (
    <section ref={secaoRef} aria-labelledby="titulo-concreto" className="relative overflow-hidden bg-background">
      <canvas ref={telaRef} aria-hidden className="pointer-events-none absolute inset-0 z-20 size-full" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-20 pb-16 sm:px-6 md:pt-28 md:pb-24">
        <div className="relative w-fit md:self-end">
          <h2
            ref={tituloRef}
            id="titulo-concreto"
            className="frase-forma relative font-heading text-[clamp(3.4rem,10.5vw,9.5rem)] leading-[0.95] font-bold tracking-[-0.035em] md:text-right"
          >
            {FRASE}
            <span aria-hidden className="frase-concreto absolute">
              {FRASE}
            </span>
          </h2>
          {/* Linha quente do corte, logo atrás do disco. */}
          <div
            ref={corteRef}
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-laranja opacity-0 shadow-[0_0_14px_3px_rgb(241_147_60/0.7)]"
          />
          <div ref={serraRef} aria-hidden hidden className="pointer-events-none absolute top-0 left-0 z-10">
            <DiscoDeSerra discoRef={discoRef} />
          </div>
        </div>
        <div className="flex flex-col gap-3 md:items-end md:text-right">
          <p className="font-heading text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.05] font-medium tracking-[-0.02em] text-laranja">
            Alugue pelo tempo da obra.
          </p>
          <p className="max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
            Do contrapiso ao acabamento, você pega o equipamento quando precisa e devolve quando o serviço acaba.
          </p>
        </div>
      </div>
    </section>
  );
}

// Dentes do disco: perfil de serra, com a ponta de metal duro destacada.
const DENTES = 28;
const polar = (r: number, a: number) => `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
const PERFIL = Array.from({ length: DENTES }, (_, i) => {
  const a = (i / DENTES) * Math.PI * 2;
  const passo = (Math.PI * 2) / DENTES;
  return [polar(84, a), polar(98, a + passo * 0.12), polar(96, a + passo * 0.38), polar(86, a + passo * 0.9)].join(" ");
}).join(" ");
const PONTAS = Array.from({ length: DENTES }, (_, i) => {
  const a = (i / DENTES) * Math.PI * 2 + ((Math.PI * 2) / DENTES) * 0.22;
  // Arredondado: servidor e navegador precisam gerar o mesmo SVG.
  const r2 = (v: number) => Math.round(v * 100) / 100;
  return { x: r2(Math.cos(a) * 96), y: r2(Math.sin(a) * 96), giro: r2((a * 180) / Math.PI + 90) };
});

/** Disco de serra mármore com a capa laranja por cima (a capa não gira). */
function DiscoDeSerra({ discoRef }: { discoRef: React.RefObject<SVGGElement | null> }) {
  return (
    <svg viewBox="-150 -150 300 300" className="size-full overflow-visible drop-shadow-[0_18px_24px_rgb(0_0_0/0.55)]">
      <defs>
        <radialGradient id="aco" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#e4e0db" />
          <stop offset="0.55" stopColor="#a9a39d" />
          <stop offset="1" stopColor="#6f6a65" />
        </radialGradient>
        <linearGradient id="capa" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6a454" />
          <stop offset="1" stopColor="#d9761f" />
        </linearGradient>
        <path id="trilha-nome" d="M -58 0 A 58 58 0 1 1 58 0 A 58 58 0 1 1 -58 0" />
      </defs>

      <g ref={discoRef}>
        <polygon points={PERFIL} fill="url(#aco)" stroke="#4d4843" strokeWidth="1" />
        {PONTAS.map((p, i) => (
          <rect key={i} x={p.x - 2.6} y={p.y - 3.4} width="5.2" height="6.8" rx="1" fill="#3b3733" transform={`rotate(${p.giro} ${p.x} ${p.y})`} />
        ))}
        {/* Anéis e rasgos de dilatação: deixam o giro visível. */}
        <circle r="78" fill="none" stroke="rgb(255 255 255 / 0.25)" strokeWidth="1" />
        <circle r="70" fill="none" stroke="rgb(0 0 0 / 0.12)" strokeWidth="6" />
        {[0, 90, 180, 270].map((g) => (
          <path key={g} d="M 0 -84 Q 6 -74 2 -66" fill="none" stroke="#3b3733" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${g})`} />
        ))}
        <text fill="#3b3733" fontSize="13" fontWeight="700" letterSpacing="3" style={{ fontFamily: "var(--font-cabin)" }}>
          <textPath href="#trilha-nome">LOCAGUIA • DIAMANTADO • LOCAGUIA • 110 MM •</textPath>
        </text>
        <circle r="30" fill="#f1933c" stroke="#c9680e" strokeWidth="2" />
        <circle r="12" fill="#241d17" />
        <polygon points={Array.from({ length: 6 }, (_, i) => polar(7, (i / 6) * Math.PI * 2)).join(" ")} fill="#8a8580" />
      </g>

      {/* Cabo e capa de proteção: parados, por cima do disco. */}
      <path d="M -46 -100 C -46 -142 46 -142 46 -100" fill="none" stroke="#241d17" strokeWidth="17" strokeLinecap="round" />
      <path d="M -46 -100 C -46 -142 46 -142 46 -100" fill="none" stroke="#443f3b" strokeWidth="12" strokeLinecap="round" />
      <path d="M -20 -132 L 20 -132" stroke="#f1933c" strokeWidth="5" strokeLinecap="round" />
      <path d="M -106 -36 A 112 112 0 0 1 106 -36 Z" fill="url(#capa)" stroke="#a9550a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M -84 -52 A 92 92 0 0 1 60 -86" fill="none" stroke="rgb(255 240 220 / 0.45)" strokeWidth="3" strokeLinecap="round" />
      <text x="0" y="-52" textAnchor="middle" fill="#241d17" fontSize="17" fontWeight="700" letterSpacing="1.5" style={{ fontFamily: "var(--font-cabin)" }}>
        LOCAGUIA
      </text>
    </svg>
  );
}
