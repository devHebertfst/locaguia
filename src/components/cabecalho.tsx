import Link from "next/link";

export function Cabecalho() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          LocaGuia
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Catálogo
          </Link>
        </nav>
      </div>
    </header>
  );
}
