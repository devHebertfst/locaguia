import { Suspense } from "react";
import type { Metadata } from "next";
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
      <div className="border-b border-terra/10 bg-white">
        <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between gap-3 px-4 text-sm sm:px-6">
          <span className="font-heading font-semibold">Painel da equipe</span>
          <Suspense fallback={null}>
            <ContaLogada />
          </Suspense>
        </div>
      </div>
      {children}
    </div>
  );
}

async function ContaLogada() {
  const usuario = await exigirUsuario();
  return (
    <form action={sair} className="flex items-center gap-3">
      <span className="hidden text-muted-foreground sm:inline">{usuario.email}</span>
      <Button type="submit" variant="outline" size="sm">
        Sair
      </Button>
    </form>
  );
}
