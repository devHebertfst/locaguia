import { Suspense } from "react";
import type { Metadata } from "next";
import { NavAdmin, NavAdminLinks } from "@/components/admin/nav-admin";
import { Button } from "@/components/ui/button";
import { exigirUsuario } from "@/lib/auth/sessao";
import { sair } from "../entrar/actions";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel LocaGuia" },
  robots: { index: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col bg-concreto">
      <div className="border-b border-foreground/10 bg-card">
        <div className="mx-auto flex min-h-14 w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 text-sm sm:px-6">
          <Suspense fallback={<NavAdminLinks />}>
            <NavComPapel />
          </Suspense>
          <Suspense fallback={null}>
            <ContaLogada />
          </Suspense>
        </div>
      </div>
      {children}
    </div>
  );
}

async function NavComPapel() {
  const usuario = await exigirUsuario();
  return <NavAdmin admin={usuario.papel === "admin"} />;
}

async function ContaLogada() {
  const usuario = await exigirUsuario();
  return (
    <form action={sair} className="flex items-center gap-3">
      <span className="hidden text-muted-foreground md:inline">{usuario.email}</span>
      <Button type="submit" variant="outline" size="sm">
        Sair
      </Button>
    </form>
  );
}
