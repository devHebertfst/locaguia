import { avaliacoesVisiveis, type Avaliacao } from "@/conteudo/avaliacoes";
import { cn } from "@/lib/utils";

export function Avaliacoes() {
  const avaliacoes = avaliacoesVisiveis();
  if (avaliacoes.length === 0) return null;
  const [destaque, ...demais] = avaliacoes;
  const temExemplo = avaliacoes.some((a) => a.exemplo);

  return (
    <section aria-labelledby="titulo-avaliacoes" className="chao-terra relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_20%_30%,#000_15%,transparent_70%)]"
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <h2 id="titulo-avaliacoes" className="text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.02em] text-white">
            Quem alugou conta
          </h2>
          {temExemplo && (
            <p className="max-w-sm rounded-xl bg-laranja px-3 py-2 text-sm font-semibold text-terra">
              Avaliações de exemplo: só aparecem em desenvolvimento. Troque pelas reais em src/conteudo/avaliacoes.ts.
            </p>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <figure className="flex flex-col justify-between gap-8 rounded-[1.25rem] bg-laranja p-6 text-terra sm:p-9">
            <Aspas className="size-12 text-terra/80" />
            <blockquote className="font-heading text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.2] font-medium text-balance">
              {destaque.texto}
            </blockquote>
            <Autor avaliacao={destaque} escuro />
          </figure>

          <ul className="flex flex-col gap-5">
            {demais.map((a) => (
              <li key={a.nome + a.contexto}>
                <figure className="flex h-full flex-col gap-5 rounded-[1.25rem] bg-white/[0.06] p-6 ring-1 ring-white/10">
                  <Estrelas nota={a.nota} />
                  <blockquote className="text-lg leading-relaxed text-white/90">{a.texto}</blockquote>
                  <Autor avaliacao={a} />
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Autor({ avaliacao, escuro }: { avaliacao: Avaliacao; escuro?: boolean }) {
  return (
    <figcaption className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-11 items-center justify-center rounded-full font-heading text-lg font-semibold",
            escuro ? "bg-terra text-laranja" : "bg-laranja text-terra",
          )}
        >
          {avaliacao.nome.charAt(0)}
        </span>
        <span className="flex flex-col">
          <span className={cn("font-semibold", escuro ? "text-terra" : "text-white")}>{avaliacao.nome}</span>
          <span className={cn("text-sm", escuro ? "text-terra/75" : "text-white/60")}>
            {avaliacao.contexto}
            {avaliacao.fonte && ` · via ${avaliacao.fonte}`}
          </span>
        </span>
      </span>
      {escuro && <Estrelas nota={avaliacao.nota} escuro />}
    </figcaption>
  );
}

function Estrelas({ nota, escuro }: { nota: number; escuro?: boolean }) {
  return (
    <span role="img" aria-label={`Nota ${nota} de 5`} className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          aria-hidden
          className={cn(
            "size-5",
            i < nota ? (escuro ? "text-terra" : "text-laranja") : escuro ? "text-terra/25" : "text-white/20",
          )}
        >
          <path
            fill="currentColor"
            d="M10 1.8l2.47 5.18 5.68.7-4.18 3.93 1.08 5.63L10 14.48l-5.05 2.76 1.08-5.63L1.85 7.68l5.68-.7L10 1.8z"
          />
        </svg>
      ))}
    </span>
  );
}

function Aspas({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 36" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M0 36V22.4C0 9.9 6.2 2.4 18.6 0l2.2 4.6C14.1 6.5 10.6 10.4 10.3 16.3H19V36H0zm28.9 0V22.4C28.9 9.9 35.1 2.4 47.5 0l2.2 4.6c-6.7 1.9-10.2 5.8-10.5 11.7h8.7V36H28.9z"
      />
    </svg>
  );
}
