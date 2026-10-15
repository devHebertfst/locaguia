import { cn } from "@/lib/utils";

// Disponível: ponto verde discreto. Indisponível: faixa cinza com o aviso.
export function SeloDisponibilidade({ disponivel, className }: { disponivel: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full text-xs font-medium",
        disponivel ? "text-[#7ed99a]" : "bg-concreto px-2.5 py-1 text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", disponivel ? "bg-[#20bd3c]" : "bg-[#9a948e]")} />
      {disponivel ? "Disponível" : "Indisponível no momento"}
    </span>
  );
}
