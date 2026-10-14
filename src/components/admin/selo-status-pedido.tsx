import { ROTULO_STATUS, type StatusPedido } from "@/lib/pedidos/status";
import { cn } from "@/lib/utils";

const ESTILO: Record<StatusPedido, string> = {
  nova: "bg-laranja text-terra",
  em_atendimento: "bg-pessego text-terra",
  fechada: "bg-[#e3f4e6] text-[#1d6b34]",
  perdida: "bg-concreto text-muted-foreground",
};

export function SeloStatusPedido({ status, className }: { status: StatusPedido; className?: string }) {
  return (
    <span className={cn("inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold", ESTILO[status], className)}>
      {ROTULO_STATUS[status]}
    </span>
  );
}
