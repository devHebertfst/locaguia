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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Área da equipe</h1>
        <p className="text-muted-foreground">
          Entre com a conta Google cadastrada pela locadora para gerenciar equipamentos e
          pedidos de orçamento.
        </p>
      </div>
      <Suspense fallback={<div aria-busy="true" className="h-20 animate-pulse rounded-lg bg-muted" />}>
        <FormularioEntrar searchParams={searchParams} />
      </Suspense>
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
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {MENSAGENS_ERRO_LOGIN[erro]}
        </p>
      )}
      <input type="hidden" name="proximo" value={proximo} />
      <Button type="submit" size="lg" className="w-full">
        Entrar com Google
      </Button>
    </form>
  );
}
