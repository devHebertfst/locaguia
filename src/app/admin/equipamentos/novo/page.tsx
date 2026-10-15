import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormularioEquipamento } from "@/components/admin/formulario-equipamento";
import { exigirUsuario } from "@/lib/auth/sessao";
import { listarTodasCategorias } from "@/lib/equipamentos/consultas";

export const metadata: Metadata = { title: "Novo equipamento" };

export default function NovoEquipamentoPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-col gap-3">
        <Link href="/admin/equipamentos" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden className="size-4" />
          Equipamentos
        </Link>
        <h1 className="text-4xl font-medium tracking-[-0.02em]">Novo equipamento</h1>
        <p className="text-muted-foreground">Depois de cadastrar, você envia as fotos na mesma tela.</p>
      </div>
      <Suspense fallback={<div aria-busy="true" className="h-[32rem] animate-pulse rounded-2xl bg-card" />}>
        <Formulario />
      </Suspense>
    </main>
  );
}

async function Formulario() {
  await exigirUsuario();
  return <FormularioEquipamento categorias={await listarTodasCategorias()} />;
}
