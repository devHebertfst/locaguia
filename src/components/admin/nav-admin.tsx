"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", rotulo: "Início" },
  { href: "/admin/pedidos", rotulo: "Pedidos" },
  { href: "/admin/equipamentos", rotulo: "Equipamentos" },
  { href: "/admin/sugestoes", rotulo: "Sugestões" },
];

// "Equipe" só aparece para o admin. A página confere o papel de novo.
const LINK_EQUIPE = { href: "/admin/equipe", rotulo: "Equipe" };

export function NavAdmin({ admin }: { admin: boolean }) {
  return <NavAdminLinks caminho={usePathname()} admin={admin} />;
}

export function NavAdminLinks({ caminho, admin }: { caminho?: string; admin?: boolean }) {
  return (
    <nav aria-label="Painel" className="flex flex-wrap items-center gap-1">
      {(admin ? [...LINKS, LINK_EQUIPE] : LINKS).map(({ href, rotulo }) => {
        const atual = href === "/admin" ? caminho === "/admin" : Boolean(caminho?.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={atual ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-concreto hover:text-foreground",
              "aria-[current=page]:bg-terra aria-[current=page]:text-white",
            )}
          >
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
