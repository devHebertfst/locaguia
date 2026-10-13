import { cn } from "@/lib/utils";

// Faixa terra no topo das páginas internas, continuação do cabeçalho.
export function TituloPagina({
  titulo,
  descricao,
  largura = "max-w-7xl",
  children,
}: {
  titulo: string;
  descricao?: string;
  largura?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="chao-terra">
      <div className={cn("mx-auto flex w-full flex-col gap-3 px-4 pt-8 pb-10 sm:px-6 md:pt-12 md:pb-14", largura)}>
        {children}
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] leading-[1.04] font-medium tracking-[-0.025em] text-white">
          {titulo}
        </h1>
        {descricao && <p className="max-w-[58ch] text-lg leading-relaxed text-white/75">{descricao}</p>}
      </div>
    </div>
  );
}
