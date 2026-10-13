"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", rotulo: "Início" },
  { href: "/admin/pedidos", rotulo: "Pedidos" },
  { href: "/admin/equipamentos", rotulo: "Equipamentos" },
];

export function NavAdmin() {
  return <NavAdminLinks caminho={usePathname()} />;
}

export function NavAdminLinks({ caminho }: { caminho?: string }) {
  return (
    <nav aria-label="Painel" className="flex items-center gap-1">
      {LINKS.map(({ href, rotulo }) => {
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
