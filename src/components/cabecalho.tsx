import Link from "next/link";

export function Cabecalho() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          LocaGuia
        </Link>
        <nav className="flex items-center gap-3 text-sm sm:gap-5">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Catálogo
          </Link>
          <Link href="/assistente" className="text-muted-foreground hover:text-foreground">
            Assistente
          </Link>
          <Link href="/orcamento" className="text-muted-foreground hover:text-foreground">
            Orçamento
          </Link>
        </nav>
      </div>
    </header>
  );
}
