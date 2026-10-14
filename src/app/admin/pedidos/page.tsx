import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SeloStatusPedido } from "@/components/admin/selo-status-pedido";
import { exigirUsuario } from "@/lib/auth/sessao";
import { formatarData } from "@/lib/datas";
import { codigoSolicitacao } from "@/lib/orcamento/mensagem";
import { contarPorStatus, listarPedidos } from "@/lib/pedidos/consultas";
import {
  FILTROS_PEDIDO,
  formatarRecebido,
  lerFiltroPedido,
  ROTULO_FILTRO,
  statusDoFiltro,
  type FiltroPedido,
} from "@/lib/pedidos/status";
import { formatarCelular } from "@/lib/telefone";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pedidos" };

export default function PedidosPage({ searchParams }: PageProps<"/admin/pedidos">) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-medium tracking-[-0.02em]">Pedidos de orçamento</h1>
        <p className="text-muted-foreground">Responda os novos pelo WhatsApp e marque o andamento de cada um.</p>
      </div>
      <Suspense fallback={<div aria-busy="true" aria-label="Carregando pedidos" className="h-96 animate-pulse rounded-2xl bg-white" />}>
        {searchParams.then((p) => (
          <Lista filtro={lerFiltroPedido(p.status)} />
        ))}
      </Suspense>
    </main>
  );
}

async function Lista({ filtro }: { filtro: FiltroPedido }) {
  await exigirUsuario();
  const [pedidos, contagem] = await Promise.all([listarPedidos(statusDoFiltro(filtro)), contarPorStatus()]);
  const total = (f: FiltroPedido) => statusDoFiltro(f).reduce((soma, s) => soma + contagem[s], 0);
  const agora = new Date();

  return (
    <>
      <nav aria-label="Filtrar pedidos" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ul className="flex gap-2 pb-1">
          {FILTROS_PEDIDO.map((f) => (
            <li key={f} className="shrink-0">
              <Link
                href={f === "abertos" ? "/admin/pedidos" : `/admin/pedidos?status=${f}`}
                aria-current={f === filtro ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
                  f === filtro ? "bg-terra text-white" : "bg-white text-terra-2 ring-1 ring-terra/12 hover:ring-terra/40",
                )}
              >
                {ROTULO_FILTRO[f]}
                <span className={cn("tabular-nums", f === filtro ? "text-white/70" : "text-muted-foreground")}>{total(f)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {pedidos.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-terra/15 p-8 text-muted-foreground">
          {filtro === "abertos" ? "Nenhum pedido esperando resposta. Os novos aparecem aqui." : "Nenhum pedido neste filtro."}
        </p>
      ) : (
        <ul aria-label="Pedidos" className="divide-y divide-terra/8 overflow-hidden rounded-2xl bg-white ring-1 ring-terra/8">
          {pedidos.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/pedidos/${p.id}`}
                className={cn(
                  "group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 p-4 transition-colors hover:bg-concreto/60 sm:px-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_auto_auto]",
                  p.status === "nova" && "bg-[#fff8f1]",
                )}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-heading text-lg font-semibold group-hover:underline">{p.nomeCliente}</span>
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formatarCelular(p.telefone)} · {codigoSolicitacao(p.id)}
                  </span>
                </span>
                <span className="col-span-2 flex min-w-0 flex-col gap-0.5 text-sm md:col-span-1">
                  <span className="truncate text-terra-2">{p.equipamentos.join(", ") || "Sem equipamento"}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatarData(p.dataInicio)} a {formatarData(p.dataFim)}
                  </span>
                </span>
                <span className="order-first col-start-2 row-start-1 flex flex-col items-end gap-1 md:order-none md:col-auto md:row-auto">
                  <SeloStatusPedido status={p.status} />
                  <span className="text-xs text-muted-foreground tabular-nums">{formatarRecebido(p.criadoEm, agora)}</span>
                </span>
                <ChevronRight aria-hidden className="hidden size-5 text-muted-foreground md:block" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
