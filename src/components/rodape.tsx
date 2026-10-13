import Link from "next/link";
import { Marca } from "./marca";

const LINKS = [
  { href: "/catalogo", rotulo: "Catálogo" },
  { href: "/assistente", rotulo: "Assistente" },
  { href: "/orcamento", rotulo: "Pedir orçamento" },
];

export function Rodape() {
  return (
    <footer className="chao-terra mt-auto">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr] md:py-16">
        <div className="flex max-w-sm flex-col gap-3">
          <Marca className="text-white" />
          <p className="text-sm leading-relaxed text-white/70">
            Aluguel de equipamentos para obra e reforma. Preço e condições são combinados no orçamento,
            direto com a locadora.
          </p>
        </div>
        <nav aria-label="Rodapé" className="flex flex-col gap-3 text-sm md:items-end">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map(({ href, rotulo }) => (
              <li key={href}>
                <Link href={href} className="text-white/80 hover:text-laranja">
                  {rotulo}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/admin" className="text-white/50 hover:text-white">
            Área da equipe
          </Link>
        </nav>
      </div>
    </footer>
  );
}
