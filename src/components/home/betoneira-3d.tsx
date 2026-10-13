"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Evento que faz o tambor acelerar (o formulário do topo dispara ao enviar).
export const EVENTO_MISTURAR = "locaguia:misturar";

const COR = {
  laranja: 0xf1933c,
  laranjaEscuro: 0xc9680e,
  grafite: 0x443f3b,
  terra: 0x241d17,
  pneu: 0x1a1512,
  aco: 0x8a8580,
};

// Betoneira modelada em código com three.js. É decorativa: sem WebGL, some
// sem afetar a página. O three só é baixado depois que a página carrega.
export function Betoneira3D({ className }: { className?: string }) {
  const caixaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const caixa = caixaRef.current;
    if (!caixa) return;
    let cancelado = false;
    let desmontar: (() => void) | undefined;

    import("three").then((THREE) => {
      if (cancelado) return;
      try {
        desmontar = montarCena(THREE, caixa);
      } catch {
        // Sem WebGL (navegador antigo, modo de economia): a cena é opcional.
      }
    });

    return () => {
      cancelado = true;
      desmontar?.();
    };
  }, []);

  return <div ref={caixaRef} aria-hidden className={cn("touch-pan-y select-none", className)} />;
}

type Three = typeof import("three");

function montarCena(THREE: Three, caixa: HTMLDivElement): () => void {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  // Placa de vídeo emulada (SwiftShader e afins) desenha na CPU: a cena fica
  // parada, como em "reduzir movimento", para não travar o aparelho.
  const reduzirMovimento =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches || renderizacaoPorSoftware(renderer);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.cursor = "grab";
  renderer.domElement.classList.add("size-full", "block", "opacity-0", "transition-opacity", "duration-700");
  caixa.appendChild(renderer.domElement);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.9, 9.2);
  camera.lookAt(0, -0.2, 0);

  // Luz quente de fim de tarde na obra, com contraluz laranja no contorno.
  cena.add(new THREE.HemisphereLight(0xfff1e3, COR.terra, 1.6));
  const sol = new THREE.DirectionalLight(0xfff4ea, 2.6);
  sol.position.set(-4, 6, 5);
  cena.add(sol);
  const contraluz = new THREE.DirectionalLight(0xffb070, 2.2);
  contraluz.position.set(5, 2, -4);
  cena.add(contraluz);

  const descartaveis: { dispose: () => void }[] = [];
  const material = (cor: number, extra: Partial<import("three").MeshStandardMaterialParameters> = {}) => {
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.6, metalness: 0.2, ...extra });
    descartaveis.push(m);
    return m;
  };
  const malha = (geo: import("three").BufferGeometry, mat: import("three").Material) => {
    descartaveis.push(geo);
    return new THREE.Mesh(geo, mat);
  };

  const maquina = new THREE.Group();
  cena.add(maquina);

  // --- Tambor (sólido de revolução), com faixas e o nome pintado ----------
  const perfil = [
    [0, -1.15], [0.38, -1.12], [0.72, -0.98], [0.96, -0.68], [1.03, -0.34], [1.03, 0.02],
    [0.95, 0.34], [0.76, 0.66], [0.54, 0.95], [0.45, 1.1], [0.47, 1.15],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const texturaTambor = pintarTambor(THREE);
  descartaveis.push(texturaTambor);
  const tambor = new THREE.Group();
  tambor.add(
    malha(
      new THREE.LatheGeometry(perfil, 96),
      material(0xffffff, { map: texturaTambor, roughness: 0.5, metalness: 0.15 }),
    ),
  );
  const interior = malha(
    new THREE.LatheGeometry(perfil.map((p) => new THREE.Vector2(p.x * 0.96, p.y * 0.985)), 48),
    material(0x2b231c, { side: THREE.BackSide, roughness: 0.9 }),
  );
  tambor.add(interior);
  const anelBoca = malha(new THREE.TorusGeometry(0.465, 0.035, 12, 64), material(COR.laranjaEscuro));
  anelBoca.rotation.x = Math.PI / 2;
  anelBoca.position.y = 1.15;
  tambor.add(anelBoca);
  const cremalheira = malha(new THREE.TorusGeometry(0.93, 0.07, 12, 96), material(COR.grafite, { metalness: 0.5 }));
  cremalheira.rotation.x = Math.PI / 2;
  cremalheira.position.y = -0.72;
  tambor.add(cremalheira);
  // Dentes da cremalheira: deixam o giro visível mesmo de lado.
  const dente = new THREE.BoxGeometry(0.06, 0.12, 0.1);
  descartaveis.push(dente);
  const matDente = material(COR.grafite, { metalness: 0.5 });
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const d = new THREE.Mesh(dente, matDente);
    d.position.set(Math.cos(a) * 1.0, -0.72, Math.sin(a) * 1.0);
    d.rotation.y = -a;
    tambor.add(d);
  }
  const eixoTambor = malha(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 16), material(COR.aco, { metalness: 0.7, roughness: 0.35 }));
  eixoTambor.position.y = -1.32;
  tambor.add(eixoTambor);

  // O berço bascula o tambor; o tambor gira dentro dele.
  const berco = new THREE.Group();
  berco.position.set(0, -0.95, 0);
  berco.rotation.z = 0.5;
  tambor.position.y = 1.62;
  berco.add(tambor);
  const travessa = malha(new THREE.BoxGeometry(0.34, 0.22, 2.5), material(COR.grafite));
  berco.add(travessa);
  const mancal = malha(new THREE.CylinderGeometry(0.2, 0.26, 0.28, 20), material(COR.grafite));
  mancal.position.y = 0.2;
  berco.add(mancal);
  maquina.add(berco);

  // --- Chassi, rodas, motor e volante ----------------------------------
  const matChassi = material(COR.grafite, { metalness: 0.35 });
  for (const z of [-0.5, 0.5]) {
    const longarina = malha(new THREE.BoxGeometry(2.7, 0.14, 0.14), matChassi);
    longarina.position.set(-0.1, -1.5, z);
    maquina.add(longarina);
  }
  for (const x of [-1.35, 1.15]) {
    const travessaChassi = malha(new THREE.BoxGeometry(0.14, 0.14, 1.14), matChassi);
    travessaChassi.position.set(x, -1.5, 0);
    maquina.add(travessaChassi);
  }
  for (const z of [-1.2, 1.2]) {
    const coluna = malha(new THREE.BoxGeometry(0.16, 0.66, 0.16), matChassi);
    coluna.position.set(0, -1.2, z);
    maquina.add(coluna);
    const braco = malha(new THREE.BoxGeometry(0.16, 0.14, 0.72), matChassi);
    braco.position.set(0, -1.5, z * 0.7);
    maquina.add(braco);
  }
  const pino = malha(new THREE.CylinderGeometry(0.06, 0.06, 2.7, 12), material(COR.aco, { metalness: 0.7, roughness: 0.35 }));
  pino.rotation.x = Math.PI / 2;
  pino.position.set(0, -0.95, 0);
  maquina.add(pino);

  const volante = malha(new THREE.TorusGeometry(0.26, 0.035, 10, 40), material(COR.laranjaEscuro));
  volante.position.set(0, -0.95, 1.42);
  maquina.add(volante);
  for (let i = 0; i < 3; i++) {
    const raio = malha(new THREE.BoxGeometry(0.03, 0.5, 0.03), material(COR.laranjaEscuro));
    raio.rotation.z = (i / 3) * Math.PI;
    raio.position.copy(volante.position);
    maquina.add(raio);
  }

  const matPneu = material(COR.pneu, { roughness: 0.95, metalness: 0 });
  const matCubo = material(COR.laranja, { roughness: 0.45 });
  const rodas: import("three").Group[] = [];
  for (const z of [-0.82, 0.82]) {
    const roda = new THREE.Group();
    roda.add(malha(new THREE.TorusGeometry(0.3, 0.13, 14, 40), matPneu));
    roda.add(malha(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 24).rotateX(Math.PI / 2), matCubo));
    roda.position.set(0.75, -1.6, z);
    rodas.push(roda);
    maquina.add(roda);
  }
  const eixoRodas = malha(new THREE.CylinderGeometry(0.05, 0.05, 1.7, 12), matChassi);
  eixoRodas.rotation.x = Math.PI / 2;
  eixoRodas.position.set(0.75, -1.6, 0);
  maquina.add(eixoRodas);

  const motor = malha(new THREE.BoxGeometry(0.62, 0.42, 0.62), material(COR.grafite, { roughness: 0.5 }));
  motor.position.set(-0.95, -1.22, 0);
  maquina.add(motor);
  const faixaMotor = malha(new THREE.BoxGeometry(0.63, 0.06, 0.63), material(COR.laranja));
  faixaMotor.position.set(-0.95, -1.08, 0);
  maquina.add(faixaMotor);
  const pe = malha(new THREE.BoxGeometry(0.1, 0.38, 0.1), matChassi);
  pe.position.set(-1.35, -1.72, 0);
  maquina.add(pe);
  const sapata = malha(new THREE.BoxGeometry(0.34, 0.04, 0.34), matChassi);
  sapata.position.set(-1.35, -1.9, 0);
  maquina.add(sapata);
  const cambao = malha(new THREE.BoxGeometry(0.9, 0.08, 0.08), matChassi);
  cambao.position.set(-1.8, -1.5, 0);
  maquina.add(cambao);

  // Sombra de contato no chão (textura radial, sem mapa de sombras).
  const texturaSombra = pintarSombra(THREE);
  descartaveis.push(texturaSombra);
  const chao = malha(
    new THREE.PlaneGeometry(5.6, 3.2),
    new THREE.MeshBasicMaterial({ map: texturaSombra, transparent: true, depthWrite: false }),
  );
  chao.rotation.x = -Math.PI / 2;
  chao.position.y = -1.92;
  maquina.add(chao);

  maquina.position.y = 0.15;

  // --- Interação: arrastar gira a máquina; rolar e enviar aceleram ------
  const estado = {
    giroY: -0.62,
    alvoGiroY: -0.62,
    incl: 0.08,
    alvoIncl: 0.08,
    arrastando: false,
    ultimoX: 0,
    ultimoY: 0,
    impulso: 0,
    rolagem: 0,
  };
  const tela = renderer.domElement;
  const aoApertar = (e: PointerEvent) => {
    estado.arrastando = true;
    estado.ultimoX = e.clientX;
    estado.ultimoY = e.clientY;
    tela.style.cursor = "grabbing";
    tela.setPointerCapture(e.pointerId);
  };
  const aoMover = (e: PointerEvent) => {
    if (!estado.arrastando) return;
    estado.alvoGiroY += (e.clientX - estado.ultimoX) * 0.012;
    estado.alvoIncl = Math.min(0.45, Math.max(-0.2, estado.alvoIncl + (e.clientY - estado.ultimoY) * 0.004));
    estado.ultimoX = e.clientX;
    estado.ultimoY = e.clientY;
    pedirQuadro();
  };
  const aoSoltar = () => {
    estado.arrastando = false;
    tela.style.cursor = "grab";
  };
  tela.addEventListener("pointerdown", aoApertar);
  tela.addEventListener("pointermove", aoMover);
  tela.addEventListener("pointerup", aoSoltar);
  tela.addEventListener("pointercancel", aoSoltar);

  const aoMisturar = () => {
    estado.impulso = 7;
    pedirQuadro();
  };
  window.addEventListener(EVENTO_MISTURAR, aoMisturar);
  const aoRolar = () => {
    estado.rolagem = Math.min(1, window.scrollY / Math.max(1, caixa.offsetHeight));
    pedirQuadro();
  };
  window.addEventListener("scroll", aoRolar, { passive: true });

  // --- Tamanho, visibilidade e laço de animação -------------------------
  const ajustar = () => {
    const { clientWidth: w, clientHeight: h } = caixa;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Em telas estreitas a câmera recua para a máquina caber inteira.
    camera.position.z = w / h < 0.9 ? 11.5 : 9.2;
    camera.updateProjectionMatrix();
    pedirQuadro();
  };
  const observadorTamanho = new ResizeObserver(ajustar);
  observadorTamanho.observe(caixa);

  let visivel = true;
  const observadorTela = new IntersectionObserver(([entrada]) => {
    visivel = entrada.isIntersecting;
    if (visivel) pedirQuadro();
  });
  observadorTela.observe(caixa);
  const aoTrocarAba = () => !document.hidden && pedirQuadro();
  document.addEventListener("visibilitychange", aoTrocarAba);

  // O Timer ignora o tempo em que a aba ficou escondida (sem salto ao voltar).
  const relogio = new THREE.Timer();
  relogio.connect(document);
  let quadro = 0;
  let primeiro = true;
  let acumulado = 0;

  function desenhar(instante?: number) {
    quadro = 0;
    relogio.update(instante);
    // Girando sozinho, 30 quadros por segundo bastam e poupam bateria;
    // arrastando, desenha em todo quadro para acompanhar o dedo.
    acumulado += relogio.getDelta();
    if (!estado.arrastando && !primeiro && acumulado < 1 / 30) {
      pedirQuadro();
      return;
    }
    const dt = Math.min(acumulado, 0.05);
    acumulado = 0;
    const t = relogio.getElapsed();

    const giroBase = reduzirMovimento ? 0 : 0.9 + estado.rolagem * 2.5;
    tambor.rotation.y += (giroBase + estado.impulso) * dt;
    estado.impulso *= Math.pow(0.18, dt);
    if (estado.impulso < 0.01) estado.impulso = 0;

    const balanco = reduzirMovimento || estado.arrastando ? 0 : Math.sin(t * 0.35) * 0.12;
    estado.giroY += (estado.alvoGiroY + balanco - estado.giroY) * Math.min(1, dt * 5);
    estado.incl += (estado.alvoIncl + estado.rolagem * 0.18 - estado.incl) * Math.min(1, dt * 5);
    maquina.rotation.y = estado.giroY;
    maquina.rotation.x = estado.incl;
    berco.rotation.z = 0.5 + estado.rolagem * 0.35;
    for (const roda of rodas) roda.rotation.z = -estado.giroY * 0.6;

    renderer.render(cena, camera);
    if (primeiro) {
      primeiro = false;
      tela.classList.replace("opacity-0", "opacity-100");
    }

    const parado =
      reduzirMovimento &&
      !estado.arrastando &&
      estado.impulso === 0 &&
      Math.abs(estado.alvoGiroY - estado.giroY) < 0.001;
    if (visivel && !document.hidden && !parado) pedirQuadro();
  }

  function pedirQuadro() {
    if (!quadro) quadro = requestAnimationFrame(desenhar);
  }

  ajustar();
  pedirQuadro();

  return () => {
    cancelAnimationFrame(quadro);
    relogio.dispose();
    observadorTamanho.disconnect();
    observadorTela.disconnect();
    document.removeEventListener("visibilitychange", aoTrocarAba);
    window.removeEventListener(EVENTO_MISTURAR, aoMisturar);
    window.removeEventListener("scroll", aoRolar);
    for (const d of descartaveis) d.dispose();
    renderer.dispose();
    tela.remove();
  };
}

function renderizacaoPorSoftware(renderer: import("three").WebGLRenderer): boolean {
  const gl = renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const nome = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  return /swiftshader|llvmpipe|software|basic render/i.test(nome);
}

// Pintura do tambor: laranja com faixas e "LOCAGUIA" duas vezes na volta.
// As coordenadas u do torno dão a volta no tambor; v vai do fundo à boca.
function pintarTambor(THREE: Three) {
  const tela = document.createElement("canvas");
  tela.width = 1024;
  tela.height = 512;
  const ctx = tela.getContext("2d")!;
  const textura = new THREE.CanvasTexture(tela);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 4;

  const pintar = () => {
    ctx.fillStyle = "#f1933c";
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = "#c9680e";
    ctx.fillRect(0, 300, 1024, 14);
    ctx.fillRect(0, 150, 1024, 10);
    ctx.fillStyle = "#241d17";
    const fonte = getComputedStyle(document.body).getPropertyValue("--font-cabin").trim() || "sans-serif";
    ctx.font = `700 64px ${fonte}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const x of [256, 768]) {
      ctx.save();
      ctx.translate(x, 232);
      ctx.fillText("LOCAGUIA", 0, 0);
      ctx.restore();
    }
    textura.needsUpdate = true;
  };
  pintar();
  // Repinta quando a Cabin terminar de carregar.
  document.fonts?.ready.then(pintar);
  return textura;
}

function pintarSombra(THREE: Three) {
  const tela = document.createElement("canvas");
  tela.width = 256;
  tela.height = 256;
  const ctx = tela.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
  g.addColorStop(0, "rgba(0,0,0,0.55)");
  g.addColorStop(0.55, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(tela);
}
