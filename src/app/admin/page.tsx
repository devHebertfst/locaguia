import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { exigirUsuario } from "@/lib/auth/sessao";
import { listarNoPainel } from "@/lib/equipamentos/consultas";
import { contarPorStatus } from "@/lib/pedidos/consultas";
import { contarSugestoesPorStatus } from "@/lib/sugestoes/consultas";

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:py-12">
      <Suspense fallback={<div aria-busy="true" className="h-40 animate-pulse rounded-2xl bg-card" />}>
        <Resumo />
      </Suspense>
    </main>
  );
}

async function Resumo() {
  const usuario = await exigirUsuario();
  const [lista, pedidos, sugestoes] = await Promise.all([listarNoPainel(), contarPorStatus(), contarSugestoesPorStatus()]);
  const ativos = lista.filter((e) => e.ativo);
  const indisponiveis = ativos.filter((e) => !e.disponivel).length;
  const semFoto = ativos.filter((e) => e.totalFotos === 0).length;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-medium tracking-[-0.02em]">Olá, {usuario.nome}</h1>
        <p className="text-muted-foreground">
          {usuario.papel === "admin" ? "Você entrou como administrador." : "Você entrou como funcionário."}
        </p>
      </div>

      <section aria-labelledby="titulo-pedidos" className="flex flex-col gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/8 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-pedidos" className="text-2xl font-semibold">
            Pedidos de orçamento
          </h2>
          <Link href="/admin/pedidos" className={buttonVariants({ variant: pedidos.nova > 0 ? "default" : "terra" })}>
            {pedidos.nova > 0 ? "Responder os novos" : "Ver pedidos"}
            <ArrowRight aria-hidden />
          </Link>
        </div>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
          <Numero rotulo="Novos, esperando resposta" valor={pedidos.nova} destaque={pedidos.nova > 0} />
          <Numero rotulo="Em atendimento" valor={pedidos.em_atendimento} />
          <Numero rotulo="Fechados" valor={pedidos.fechada} />
        </dl>
      </section>

      {sugestoes.pendente > 0 && (
        <section aria-labelledby="titulo-sugestoes" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-accent p-5 sm:px-7">
          <div className="flex flex-col gap-0.5">
            <h2 id="titulo-sugestoes" className="text-xl font-semibold">
              {sugestoes.pendente === 1 ? "1 sugestão de cliente para olhar" : `${sugestoes.pendente} sugestões de clientes para olhar`}
            </h2>
            <p className="text-sm text-muted-foreground">Equipamentos que procuraram e a loja não tem, ou que estão esperando voltar.</p>
          </div>
          <Link href="/admin/sugestoes" className={buttonVariants({ variant: "terra" })}>
            Ver sugestões
            <ArrowRight aria-hidden />
          </Link>
        </section>
      )}

      <section aria-labelledby="titulo-equipamentos" className="flex flex-col gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/8 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-equipamentos" className="text-2xl font-semibold">
            Equipamentos
          </h2>
          <Link href="/admin/equipamentos" className={buttonVariants({ variant: "terra" })}>
            Gerenciar
            <ArrowRight aria-hidden />
          </Link>
        </div>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
          <Numero rotulo="No catálogo" valor={ativos.length} />
          <Numero rotulo="Indisponíveis agora" valor={indisponiveis} />
          <Numero rotulo="Sem foto" valor={semFoto} destaque={semFoto > 0} />
        </dl>
        {semFoto > 0 && (
          <p className="text-sm text-muted-foreground">
            Equipamentos com foto passam mais confiança no catálogo. Abra um equipamento para enviar fotos.
          </p>
        )}
      </section>
    </>
  );
}

function Numero({ rotulo, valor, destaque }: { rotulo: string; valor: number; destaque?: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-0.5 border-t border-foreground/10 pt-3">
      <dt className="text-sm text-muted-foreground">{rotulo}</dt>
      <dd className={destaque ? "font-heading text-3xl font-semibold text-laranja tabular-nums" : "font-heading text-3xl font-semibold tabular-nums"}>
        {valor}
      </dd>
    </div>
  );
}
