import { Suspense } from "react";
import type { Metadata } from "next";
import { FormularioSugestao } from "@/components/sugestoes/formulario-sugestao";
import { TituloPagina } from "@/components/titulo-pagina";
import { env } from "@/lib/env";
import { lerPreenchimentoSugestao } from "@/lib/sugestoes/validacao";

export const metadata: Metadata = {
  title: "Sugerir equipamento",
  description: "Não achou o equipamento que precisa? Diga qual é e a locadora avalia ter ele.",
};

export default function SugerirPage({ searchParams }: PageProps<"/sugerir">) {
  return (
    <main className="flex flex-1 flex-col bg-concreto">
      <TituloPagina
        titulo="Sugerir equipamento"
        descricao="Não achou o que precisa? Conte qual equipamento você procura. A locadora usa as sugestões para decidir o que comprar."
        largura="max-w-3xl"
      />
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:px-6 md:py-12">
        <Suspense fallback={<div aria-busy="true" className="h-96 animate-pulse rounded-2xl bg-card" />}>
          {searchParams.then((p) => {
            const preenchimento = lerPreenchimentoSugestao(p);
            return (
              <FormularioSugestao
                tipo="novo_equipamento"
                nomeEquipamentoInicial={preenchimento.nomeEquipamento}
                motivoInicial={preenchimento.motivo}
                turnstileSiteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                className="rounded-2xl bg-card p-5 ring-1 ring-foreground/8 sm:p-7"
              />
            );
          })}
        </Suspense>
      </div>
    </main>
  );
}
