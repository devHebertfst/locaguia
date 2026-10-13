import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, Plus } from "lucide-react";
import { BotaoEnvio } from "@/components/admin/botao-envio";
import { Situacao } from "@/components/admin/situacao";
import { buttonVariants } from "@/components/ui/button";
import { exigirUsuario } from "@/lib/auth/sessao";
import { listarNoPainel, type EquipamentoPainel } from "@/lib/equipamentos/consultas";
import { cn } from "@/lib/utils";
import { alterarSituacao } from "./actions";

export const metadata: Metadata = { title: "Equipamentos" };

export default function EquipamentosAdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-medium tracking-[-0.02em]">Equipamentos</h1>
          <p className="text-muted-foreground">
            Cadastre, edite e marque o que está disponível. Desativar tira do catálogo sem apagar.
          </p>
        </div>
        <Link href="/admin/equipamentos/novo" className={buttonVariants({ size: "lg" })}>
          <Plus aria-hidden />
          Novo equipamento
        </Link>
      </div>
      <Suspense fallback={<div aria-busy="true" aria-label="Carregando equipamentos" className="h-96 animate-pulse rounded-2xl bg-white" />}>
        <Lista />
      </Suspense>
    </main>
  );
}

async function Lista() {
  await exigirUsuario();
  const lista = await listarNoPainel();
  const ativos = lista.filter((e) => e.ativo);
  const desativados = lista.filter((e) => !e.ativo);

  return (
    <>
      <Grupo titulo="No catálogo" equipamentos={ativos} vazio="Nenhum equipamento no catálogo. Cadastre o primeiro." />
      {desativados.length > 0 && (
        <Grupo
          titulo="Desativados"
          descricao="Não aparecem no catálogo nem para o assistente, mas continuam nos pedidos antigos."
          equipamentos={desativados}
        />
      )}
    </>
  );
}

function Grupo({
  titulo,
  descricao,
  equipamentos,
  vazio,
}: {
  titulo: string;
  descricao?: string;
  equipamentos: EquipamentoPainel[];
  vazio?: string;
}) {
  const id = `grupo-${titulo.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 id={id} className="text-xl font-semibold">
          {titulo} <span className="font-sans text-base font-normal text-muted-foreground tabular-nums">({equipamentos.length})</span>
        </h2>
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </div>
      {equipamentos.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-terra/15 p-6 text-muted-foreground">{vazio}</p>
      ) : (
        <ul className="divide-y divide-terra/8 overflow-hidden rounded-2xl bg-white ring-1 ring-terra/8">
          {equipamentos.map((e) => (
            <Linha key={e.id} equipamento={e} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Linha({ equipamento: e }: { equipamento: EquipamentoPainel }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 p-3 sm:flex-nowrap sm:px-4">
      <Link href={`/admin/equipamentos/${e.id}`} className="group flex min-w-0 flex-1 items-center gap-4">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-[#fbe7d3]">
          {e.capa ? (
            <Image src={e.capa} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-laranja-escuro/70">
              <ImageOff aria-hidden className="size-5" />
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-heading text-lg font-semibold group-hover:underline">{e.nome}</span>
          <span className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span>{e.categoria}</span>
            <span aria-hidden>·</span>
            <span className={cn(e.totalFotos === 0 && "font-medium text-laranja-escuro")}>
              {e.totalFotos === 0 ? "sem foto" : e.totalFotos === 1 ? "1 foto" : `${e.totalFotos} fotos`}
            </span>
          </span>
        </span>
      </Link>

      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
        {e.ativo ? (
          <Situacao disponivel={e.disponivel} />
        ) : (
          <span className="rounded-full bg-concreto px-2.5 py-1 text-xs font-medium text-muted-foreground">Desativado</span>
        )}
        <form action={alterarSituacao}>
          <input type="hidden" name="id" value={e.id} />
          {e.ativo ? (
            <>
              <input type="hidden" name="campo" value="disponivel" />
              <input type="hidden" name="valor" value={String(!e.disponivel)} />
              <BotaoEnvio variant="outline" size="sm" pendente="Salvando…" className="w-40" aria-label={`${e.disponivel ? "Marcar indisponível" : "Marcar disponível"}: ${e.nome}`}>
                {e.disponivel ? "Marcar indisponível" : "Marcar disponível"}
              </BotaoEnvio>
            </>
          ) : (
            <>
              <input type="hidden" name="campo" value="ativo" />
              <input type="hidden" name="valor" value="true" />
              <BotaoEnvio variant="outline" size="sm" pendente="Reativando…" className="w-40" aria-label={`Reativar: ${e.nome}`}>
                Reativar
              </BotaoEnvio>
            </>
          )}
        </form>
      </div>
    </li>
  );
}
