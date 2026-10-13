import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { FormularioOrcamento } from "@/components/orcamento/formulario-orcamento";
import { listarDisponiveis } from "@/lib/catalogo/consultas";
import { hojeNaLocadora } from "@/lib/datas";
import { env } from "@/lib/env";
import { lerPreenchimento } from "@/lib/orcamento/params";

export const metadata: Metadata = {
  title: "Pedir orçamento",
  description: "Escolha os equipamentos, informe o período e envie seu pedido de orçamento.",
};

export default function OrcamentoPage({ searchParams }: PageProps<"/orcamento">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pedir orçamento</h1>
        <p className="text-muted-foreground">
          Conte o que você precisa e para quando. A locadora responde com preço e condições.
        </p>
      </div>
      <Suspense fallback={<div aria-busy="true" className="h-96 animate-pulse rounded-xl bg-muted" />}>
        <Formulario searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Formulario({ searchParams }: Pick<PageProps<"/orcamento">, "searchParams">) {
  const preenchimento = lerPreenchimento(await searchParams);
  await connection(); // "hoje" é calculado a cada pedido, não no build
  const disponiveis = await listarDisponiveis();
  const idsDisponiveis = new Set(disponiveis.map((e) => e.id));
  const selecionados = preenchimento.equipamentos.filter((id) => idsDisponiveis.has(id));
  const foraDoPedido = preenchimento.equipamentos.length - selecionados.length;

  return (
    <>
      {foraDoPedido > 0 && (
        <p className="rounded-lg border bg-muted/60 p-3 text-sm">
          {foraDoPedido === 1
            ? "Um equipamento escolhido não está disponível agora e ficou fora do pedido."
            : `${foraDoPedido} equipamentos escolhidos não estão disponíveis agora e ficaram fora do pedido.`}
        </p>
      )}
      <FormularioOrcamento
        disponiveis={disponiveis}
        selecionadosIniciais={selecionados}
        servicoInicial={preenchimento.servico}
        materiais={preenchimento.materiais}
        hoje={hojeNaLocadora()}
        turnstileSiteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      />
    </>
  );
}
