import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { BotaoEnvio } from "@/components/admin/botao-envio";
import { FormularioEquipamento } from "@/components/admin/formulario-equipamento";
import { FotosEquipamento } from "@/components/admin/fotos-equipamento";
import { Situacao } from "@/components/admin/situacao";
import { exigirUsuario } from "@/lib/auth/sessao";
import { listarTodasCategorias, obterParaEdicao } from "@/lib/equipamentos/consultas";
import { env } from "@/lib/env";
import { envioDeFotosConfigurado } from "@/lib/supabase/admin";
import { alterarSituacao } from "../actions";

export const metadata: Metadata = { title: "Editar equipamento" };

export default function EditarEquipamentoPage({ params, searchParams }: PageProps<"/admin/equipamentos/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
      <Link href="/admin/equipamentos" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" />
        Equipamentos
      </Link>
      <Suspense fallback={<div aria-busy="true" className="h-[40rem] animate-pulse rounded-2xl bg-card" />}>
        {Promise.all([params, searchParams]).then(([{ id }, busca]) => (
          <Edicao id={id} criado={busca.criado === "1"} />
        ))}
      </Suspense>
    </main>
  );
}

async function Edicao({ id, criado }: { id: string; criado: boolean }) {
  await exigirUsuario();
  const [equipamento, categorias] = await Promise.all([obterParaEdicao(id), listarTodasCategorias()]);
  if (!equipamento) notFound();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-medium tracking-[-0.02em]">{equipamento.nome}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {equipamento.ativo ? (
              <Situacao disponivel={equipamento.disponivel} />
            ) : (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">Desativado</span>
            )}
          </div>
        </div>
        {equipamento.ativo && (
          <Link
            href={`/equipamentos/${equipamento.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-laranja underline"
          >
            Ver no catálogo
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        )}
      </div>

      {criado && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-[#203826] p-4 text-sm font-medium text-[#7ed99a]">
          <CheckCircle2 aria-hidden className="size-4 shrink-0" />
          Equipamento cadastrado. Agora envie as fotos.
        </p>
      )}

      <FotosEquipamento
        equipamentoId={equipamento.id}
        nome={equipamento.nome}
        fotos={equipamento.fotos}
        storage={
          envioDeFotosConfigurado()
            ? { url: env.NEXT_PUBLIC_SUPABASE_URL, chave: env.supabaseChavePublica, bucket: env.SUPABASE_BUCKET_FOTOS }
            : null
        }
      />

      <FormularioEquipamento
        id={equipamento.id}
        categorias={categorias}
        valores={{
          nome: equipamento.nome,
          categoria: equipamento.categoria,
          descricao: equipamento.descricao,
          disponivel: equipamento.disponivel,
        }}
      />

      <section aria-labelledby="titulo-catalogo" className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/8 sm:p-7">
        <h2 id="titulo-catalogo" className="text-2xl font-semibold">
          {equipamento.ativo ? "Tirar do catálogo" : "Voltar ao catálogo"}
        </h2>
        <p className="max-w-[60ch] text-sm text-muted-foreground">
          {equipamento.ativo
            ? "Desative quando a loja não alugar mais este equipamento (vendeu, quebrou de vez). Ele some do catálogo e do assistente, mas continua nos pedidos antigos e pode ser reativado."
            : "Este equipamento não aparece no catálogo nem para o assistente. Reative para ele voltar."}
        </p>
        <form action={alterarSituacao}>
          <input type="hidden" name="id" value={equipamento.id} />
          <input type="hidden" name="campo" value="ativo" />
          <input type="hidden" name="valor" value={String(!equipamento.ativo)} />
          <BotaoEnvio
            variant={equipamento.ativo ? "destructive" : "terra"}
            pendente={equipamento.ativo ? "Desativando…" : "Reativando…"}
          >
            {equipamento.ativo ? "Desativar equipamento" : "Reativar equipamento"}
          </BotaoEnvio>
        </form>
      </section>
    </>
  );
}
