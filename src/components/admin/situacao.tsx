import { cn } from "@/lib/utils";

// Selo de disponibilidade no painel (no catálogo público, o selo é outro).
export function Situacao({ disponivel }: { disponivel: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        disponivel ? "bg-[#e3f4e6] text-[#1d6b34]" : "bg-concreto text-muted-foreground",
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", disponivel ? "bg-[#20bd3c]" : "bg-[#9a948e]")} />
      {disponivel ? "Disponível" : "Indisponível"}
    </span>
  );
}
