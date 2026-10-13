import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { destinoSeguro, lerErroLogin, MENSAGENS_ERRO_LOGIN } from "@/lib/auth/regras";
import { usuarioAtual } from "@/lib/auth/sessao";
import { entrarComGoogle } from "./actions";

export const metadata: Metadata = {
  title: "Área da equipe",
  robots: { index: false },
};

export default function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  return (
    <main className="flex flex-1 items-center justify-center bg-concreto px-4 py-16">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-white p-6 ring-1 ring-terra/8 sm:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-medium tracking-[-0.02em]">Área da equipe</h1>
          <p className="text-muted-foreground">
            Entre com a conta Google cadastrada pela locadora para gerenciar equipamentos e
            pedidos de orçamento.
          </p>
        </div>
        <Suspense fallback={<div aria-busy="true" className="h-12 animate-pulse rounded-full bg-concreto" />}>
          <FormularioEntrar searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function FormularioEntrar({ searchParams }: Pick<PageProps<"/entrar">, "searchParams">) {
  const params = await searchParams;
  const proximo = destinoSeguro(params.proximo);
  if (await usuarioAtual()) redirect(proximo);
  const erro = lerErroLogin(params.erro);

  return (
    <form action={entrarComGoogle} className="flex flex-col gap-3">
      {erro && (
        <p role="alert" className="rounded-xl bg-destructive/8 p-4 text-sm text-destructive ring-1 ring-destructive/30">
          {MENSAGENS_ERRO_LOGIN[erro]}
        </p>
      )}
      <input type="hidden" name="proximo" value={proximo} />
      <Button type="submit" size="lg" variant="terra" className="w-full">
        Entrar com Google
      </Button>
    </form>
  );
}
