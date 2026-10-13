import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function EquipamentoNaoEncontrado() {
  return (
    <main className="flex flex-1 flex-col bg-concreto">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-4 px-4 py-20 sm:px-6">
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] leading-tight font-medium tracking-[-0.025em]">
          Equipamento não encontrado
        </h1>
        <p className="text-lg text-muted-foreground">Ele pode ter sido removido do catálogo.</p>
        <Link href="/#catalogo" className={buttonVariants({ variant: "terra", size: "lg" })}>
          Ver todos os equipamentos
        </Link>
      </div>
    </main>
  );
}
