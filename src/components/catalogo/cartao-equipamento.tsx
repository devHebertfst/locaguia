import Link from "next/link";
import type { EquipamentoCatalogo } from "@/lib/catalogo/consultas";
import { cn } from "@/lib/utils";
import { FotoEquipamento } from "./foto-equipamento";
import { SeloDisponibilidade } from "./selo-disponibilidade";

export function CartaoEquipamento({ equipamento }: { equipamento: EquipamentoCatalogo }) {
  return (
    <Link
      href={`/equipamentos/${equipamento.id}`}
      className={cn(
        // No celular o cartão é horizontal (miniatura à esquerda), para caber
        // vários equipamentos na tela; a partir do tablet, a foto vai em cima.
        "group flex w-full overflow-hidden rounded-xl border bg-card transition-colors hover:border-foreground/30 sm:flex-col",
        !equipamento.disponivel && "opacity-75",
      )}
    >
      <FotoEquipamento
        src={equipamento.fotos[0]}
        alt={equipamento.nome}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 112px"
        className="aspect-square w-28 shrink-0 self-start sm:aspect-[4/3] sm:w-full"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {equipamento.categoria}
        </p>
        <h2 className="font-semibold leading-snug group-hover:underline">{equipamento.nome}</h2>
        <p className="line-clamp-2 text-sm text-muted-foreground">{equipamento.descricao}</p>
        <div className="mt-auto pt-1">
          <SeloDisponibilidade disponivel={equipamento.disponivel} />
        </div>
      </div>
    </Link>
  );
}
