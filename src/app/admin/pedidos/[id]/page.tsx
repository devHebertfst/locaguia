import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { BotaoEnvio } from "@/components/admin/botao-envio";
import { SeloStatusPedido } from "@/components/admin/selo-status-pedido";
import { exigirUsuario } from "@/lib/auth/sessao";
import { formatarData } from "@/lib/datas";
import { codigoSolicitacao } from "@/lib/orcamento/mensagem";
import { obterPedido, type PedidoDetalhe } from "@/lib/pedidos/consultas";
import {
  acoesDoStatus,
  diasDoPeriodo,
  formatarRecebido,
  linkWhatsappCliente,
  mensagemParaCliente,
} from "@/lib/pedidos/status";
import { formatarCelular } from "@/lib/telefone";
import { alterarStatusPedido } from "../actions";

export const metadata: Metadata = { title: "Pedido" };

export default function PedidoPage({ params }: PageProps<"/admin/pedidos/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
      <Link href="/admin/pedidos" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" />
        Pedidos
      </Link>
      <Suspense fallback={<div aria-busy="true" className="h-[36rem] animate-pulse rounded-2xl bg-white" />}>
        {params.then(({ id }) => (
          <Detalhe id={id} />
        ))}
      </Suspense>
    </main>
  );
}

async function Detalhe({ id }: { id: string }) {
  await exigirUsuario();
  const pedido = await obterPedido(id);
  if (!pedido) notFound();
  const dias = diasDoPeriodo(pedido.dataInicio, pedido.dataFim);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SeloStatusPedido status={pedido.status} />
          <span className="text-sm text-muted-foreground tabular-nums">
            Pedido {codigoSolicitacao(pedido.id)} · recebido {formatarRecebido(pedido.criadoEm)}
          </span>
        </div>
        <h1 className="text-4xl font-medium tracking-[-0.02em]">{pedido.nomeCliente}</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-start">
        <div className="flex flex-col gap-6">
          <Bloco titulo="Período">
            <p className="font-heading text-2xl font-semibold tabular-nums">
              {formatarData(pedido.dataInicio)} a {formatarData(pedido.dataFim)}
            </p>
            <p className="text-sm text-muted-foreground">
              {dias === 1 ? "1 dia" : `${dias} dias`}, contando a retirada e a devolução
            </p>
          </Bloco>

          <Bloco titulo="Equipamentos">
            <ul className="flex flex-col divide-y divide-terra/8">
              {pedido.equipamentos.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                  <span className="flex flex-col">
                    <Link href={`/admin/equipamentos/${e.id}`} className="font-semibold hover:underline">
                      {e.nome}
                    </Link>
                    <span className="text-sm text-muted-foreground">{e.categoria}</span>
                  </span>
                  <SituacaoAtual equipamento={e} />
                </li>
              ))}
            </ul>
          </Bloco>

          <Bloco titulo="Serviço descrito pelo cliente">
            <p className="max-w-[65ch] leading-relaxed whitespace-pre-line">{pedido.servico}</p>
          </Bloco>

          {pedido.materiais.length > 0 && (
            <Bloco titulo="Materiais sugeridos pelo assistente">
              <ul className="grid gap-x-6 gap-y-1 text-terra-2 sm:grid-cols-2">
                {pedido.materiais.map((m) => (
                  <li key={m} className="flex items-baseline gap-2 before:size-1.5 before:shrink-0 before:translate-y-[-0.15em] before:rounded-full before:bg-laranja-escuro before:content-['']">
                    {m}
                  </li>
                ))}
              </ul>
            </Bloco>
          )}
        </div>

        <aside className="flex flex-col gap-6 md:sticky md:top-6">
          <Bloco titulo="Cliente">
            <p className="font-heading text-xl font-semibold tabular-nums">{formatarCelular(pedido.telefone)}</p>
            <a
              href={linkWhatsappCliente(pedido.telefone, mensagemParaCliente({ ...pedido, nome: pedido.nomeCliente }))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1f8f4e] px-6 font-semibold text-white transition-colors hover:bg-[#1a7a43]"
            >
              <MessageCircle aria-hidden className="size-5" />
              Responder no WhatsApp
            </a>
            <p className="text-sm text-muted-foreground">
              {pedido.aceitaWhatsapp
                ? "Aceitou receber avisos automáticos sobre este pedido."
                : "Não pediu avisos automáticos: fale com ele só sobre este orçamento."}
            </p>
          </Bloco>

          <Andamento pedido={pedido} />
        </aside>
      </div>
    </article>
  );
}

function Andamento({ pedido }: { pedido: PedidoDetalhe }) {
  return (
    <Bloco titulo="Andamento">
      <div className="flex flex-col gap-2">
        {acoesDoStatus(pedido.status).map((acao) => (
          <form key={acao.para} action={alterarStatusPedido}>
            <input type="hidden" name="id" value={pedido.id} />
            <input type="hidden" name="status" value={acao.para} />
            <BotaoEnvio variant={acao.principal ? "terra" : "outline"} pendente="Salvando…" className="w-full">
              {acao.rotulo}
            </BotaoEnvio>
          </form>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Preço e condições são combinados com o cliente. O pedido não reserva o equipamento.
      </p>
    </Bloco>
  );
}

function SituacaoAtual({ equipamento }: { equipamento: PedidoDetalhe["equipamentos"][number] }) {
  if (!equipamento.ativo) {
    return <span className="rounded-full bg-terra px-2.5 py-1 text-xs font-medium text-white">Desativado</span>;
  }
  if (!equipamento.disponivel) {
    return <span className="rounded-full bg-concreto px-2.5 py-1 text-xs font-medium text-muted-foreground">Indisponível agora</span>;
  }
  return <span className="text-xs font-medium text-[#1d6b34]">Disponível agora</span>;
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-terra/8 sm:p-6">
      <h2 className="text-sm font-semibold text-muted-foreground">{titulo}</h2>
      {children}
    </section>
  );
}
