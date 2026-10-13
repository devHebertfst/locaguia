"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS: { href: string; rotulo: string }[] = [
  { href: "/catalogo", rotulo: "Catálogo" },
  { href: "/assistente", rotulo: "Assistente" },
];

export function NavPrincipal() {
  return <NavLinks caminho={usePathname()} />;
}

// Sem o caminho (antes de a página hidratar), nenhum link fica marcado.
export function NavLinks({ caminho }: { caminho?: string }) {
  return (
    <nav aria-label="Principal" className="flex items-center gap-0.5 text-[0.8rem] sm:gap-2 sm:text-sm">
      {LINKS.map(({ href, rotulo }) => {
        const atual = Boolean(caminho?.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={atual ? "page" : undefined}
            className={cn(
              "relative rounded-full px-1.5 py-2 font-medium sm:px-3 text-white/75 transition-colors hover:text-white",
              "after:absolute after:inset-x-1.5 sm:after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-laranja after:transition-transform after:duration-300",
              "aria-[current=page]:text-white aria-[current=page]:after:scale-x-100",
            )}
          >
            {rotulo}
          </Link>
        );
      })}
      <Link
        href="/orcamento"
        aria-current={caminho?.startsWith("/orcamento") ? "page" : undefined}
        className={buttonVariants({ size: "sm", className: "ml-1 h-9 px-3 sm:px-4" })}
      >
        Orçamento
      </Link>
    </nav>
  );
}
