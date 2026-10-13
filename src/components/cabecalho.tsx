import { Suspense } from "react";
import Link from "next/link";
import { Marca } from "./marca";
import { NavLinks, NavPrincipal } from "./nav-principal";

export function Cabecalho() {
  return (
    <header className="chao-terra relative z-20 border-b border-white/10">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="LocaGuia, página inicial" className="rounded-md text-white">
          <Marca compacta />
        </Link>
        <Suspense fallback={<NavLinks />}>
          <NavPrincipal />
        </Suspense>
      </div>
    </header>
  );
}
