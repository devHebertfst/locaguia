import Link from "next/link";

export default function EquipamentoNaoEncontrado() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start gap-3 px-4 py-16">
      <h1 className="text-2xl font-semibold">Equipamento não encontrado</h1>
      <p className="text-muted-foreground">Ele pode ter sido removido do catálogo.</p>
      <Link href="/" className="underline underline-offset-4">
        Ver todos os equipamentos
      </Link>
    </main>
  );
}
