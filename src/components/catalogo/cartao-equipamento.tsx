import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { EquipamentoCatalogo } from "@/lib/catalogo/consultas";
import { hrefOrcamento } from "@/lib/orcamento/params";
import { cn } from "@/lib/utils";
import { FotoEquipamento } from "./foto-equipamento";
import { SeloDisponibilidade } from "./selo-disponibilidade";

export function CartaoEquipamento({ equipamento }: { equipamento: EquipamentoCatalogo }) {
  const idNome = `equipamento-${equipamento.id}`;

  return (
    <article
      className="group relative flex w-full flex-col gap-3 rounded-xl bg-white p-2.5 shadow-[0_1px_2px_rgb(36_29_23/0.06)] ring-1 ring-terra/8 transition-[box-shadow,translate] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgb(36_29_23/0.35)] sm:gap-0 sm:p-3"
    >
      {/* No celular a foto fica à esquerda do nome, para caber
          vários equipamentos na tela; a partir do tablet, ela vai em cima. */}
      <Link href={`/equipamentos/${equipamento.id}`} className="flex min-w-0 flex-1 gap-3 rounded-lg sm:flex-col sm:gap-4">
        <FotoEquipamento
          src={equipamento.fotos[0]}
          alt={equipamento.nome}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 112px"
          className={cn(
            "aspect-square w-28 shrink-0 self-start rounded-lg sm:aspect-[4/3] sm:w-full",
            !equipamento.disponivel && "grayscale-[0.7]",
          )}
        />
        <span className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5 sm:px-1.5">
          <h3 id={idNome} className="text-lg leading-snug font-semibold sm:text-xl">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]">
              {equipamento.nome}
            </span>
          </h3>
          <span className="text-sm font-medium text-laranja-escuro">{equipamento.categoria}</span>
          <span className="line-clamp-2 text-sm text-muted-foreground">{equipamento.descricao}</span>
          <SeloDisponibilidade disponivel={equipamento.disponivel} className="mt-1" />
        </span>
      </Link>
      {equipamento.disponivel && (
        <Link
          href={hrefOrcamento({ equipamentos: [equipamento.id] })}
          aria-describedby={idNome}
          className="mt-auto flex h-10 items-center justify-between rounded-full bg-concreto pr-1.5 pl-4 text-sm font-semibold transition-colors hover:bg-laranja sm:mx-1.5 sm:mt-4 sm:mb-0.5"
        >
          Pedir orçamento
          <span className="flex size-7 items-center justify-center rounded-full bg-terra text-white">
            <ArrowUpRight aria-hidden className="size-4" />
          </span>
        </Link>
      )}
    </article>
  );
}
