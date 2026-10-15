import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BellRing, MessageCircle } from "lucide-react";
import { BotaoEnvio } from "@/components/admin/botao-envio";
import { Situacao } from "@/components/admin/situacao";
import { exigirUsuario } from "@/lib/auth/sessao";
import { listarDisponiveis, type OpcaoEquipamento } from "@/lib/catalogo/consultas";
import { formatarRecebido, linkWhatsappCliente } from "@/lib/pedidos/status";
import { contarSugestoesPorStatus, listarSugestoes, type SugestaoPainel } from "@/lib/sugestoes/consultas";
import {
  FILTROS_SUGESTAO,
  lerFiltroSugestao,
  mensagemSobreSugestao,
  ROTULO_FILTRO_SUGESTAO,
  ROTULO_TIPO_SUGESTAO,
  statusDoFiltroSugestao,
  type FiltroSugestao,
} from "@/lib/sugestoes/status";
import { formatarCelular } from "@/lib/telefone";
import { cn } from "@/lib/utils";
import { alterarStatusSugestao, atenderSugestao } from "./actions";

export const metadata: Metadata = { title: "Sugestões" };

export default function SugestoesPage({ searchParams }: PageProps<"/admin/sugestoes">) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-medium tracking-[-0.02em]">Sugestões dos clientes</h1>
        <p className="max-w-[70ch] text-muted-foreground">
          Equipamentos que os clientes procuraram e a loja não tem, e quem está esperando um equipamento voltar.
        </p>
      </div>
      <Suspense fallback={<div aria-busy="true" aria-label="Carregando sugestões" className="h-96 animate-pulse rounded-2xl bg-card" />}>
        {searchParams.then((p) => (
          <Lista filtro={lerFiltroSugestao(p.status)} />
        ))}
      </Suspense>
    </main>
  );
}

async function Lista({ filtro }: { filtro: FiltroSugestao }) {
  await exigirUsuario();
  const [itens, contagem, disponiveis] = await Promise.all([
    listarSugestoes(statusDoFiltroSugestao(filtro)),
    contarSugestoesPorStatus(),
    listarDisponiveis(),
  ]);
  const total = (f: FiltroSugestao) => statusDoFiltroSugestao(f).reduce((soma, s) => soma + contagem[s], 0);
  const agora = new Date();

  return (
    <>
      <nav aria-label="Filtrar sugestões" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ul className="flex gap-2 pb-1">
          {FILTROS_SUGESTAO.map((f) => (
            <li key={f} className="shrink-0">
              <Link
                href={f === "pendente" ? "/admin/sugestoes" : `/admin/sugestoes?status=${f}`}
                aria-current={f === filtro ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
                  f === filtro ? "bg-creme text-terra" : "bg-card text-muted-foreground ring-1 ring-foreground/12 hover:ring-foreground/40",
                )}
              >
                {ROTULO_FILTRO_SUGESTAO[f]}
                <span className={cn("tabular-nums", f === filtro ? "text-terra/70" : "text-muted-foreground")}>{total(f)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {itens.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-foreground/15 p-8 text-muted-foreground">
          {filtro === "pendente"
            ? "Nenhuma sugestão esperando. Elas chegam pelo catálogo, pelo assistente e pelos equipamentos indisponíveis."
            : "Nenhuma sugestão neste filtro."}
        </p>
      ) : (
        <ul aria-label="Sugestões" className="flex flex-col gap-3">
          {itens.map((s) => (
            <li key={s.id}>
              <Cartao sugestao={s} disponiveis={disponiveis} agora={agora} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Cartao({ sugestao: s, disponiveis, agora }: { sugestao: SugestaoPainel; disponiveis: OpcaoEquipamento[]; agora: Date }) {
  return (
    <article
      aria-label={s.nomeEquipamento}
      className={cn(
        "grid gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/8 sm:p-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]",
        s.status === "pendente" && s.tipo === "novo_equipamento" && "bg-laranja/[0.07]",
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-medium text-laranja">{ROTULO_TIPO_SUGESTAO[s.tipo]}</span>
          <span className="text-muted-foreground tabular-nums">{formatarRecebido(s.criadoEm, agora)}</span>
        </div>
        <h2 className="font-heading text-2xl font-semibold">
          {s.equipamento ? (
            <Link href={`/admin/equipamentos/${s.equipamento.id}`} className="hover:underline">
              {s.nomeEquipamento}
            </Link>
          ) : (
            s.nomeEquipamento
          )}
        </h2>
        {s.motivo && <p className="max-w-[65ch] whitespace-pre-line text-muted-foreground">{s.motivo}</p>}
        <Resolucao sugestao={s} disponiveis={disponiveis} />
      </div>

      <div className="flex flex-col gap-3 border-t border-foreground/10 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">{s.nomeCliente}</span>
          <span className="text-sm text-muted-foreground tabular-nums">{formatarCelular(s.telefone)}</span>
        </div>
        <p className={cn("flex items-center gap-1.5 text-sm", s.querAviso ? "font-medium text-[#7ed99a]" : "text-muted-foreground")}>
          {s.querAviso && <BellRing aria-hidden className="size-4" />}
          {s.querAviso ? "Pediu aviso automático no WhatsApp" : "Não pediu aviso automático"}
        </p>
        <a
          href={linkWhatsappCliente(s.telefone, mensagemSobreSugestao(s))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-full bg-[#1f8f4e] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1a7a43]"
        >
          <MessageCircle aria-hidden className="size-4" />
          Falar no WhatsApp
        </a>
      </div>
    </article>
  );
}

function Resolucao({ sugestao: s, disponiveis }: { sugestao: SugestaoPainel; disponiveis: OpcaoEquipamento[] }) {
  if (s.status === "atendida") {
    return (
      <p className="text-sm text-[#7ed99a]">
        Atendida{s.atendidoPor && <> com <Link href={`/admin/equipamentos/${s.atendidoPor.id}`} className="font-medium underline">{s.atendidoPor.nome}</Link></>}
        {s.querAviso && ". O aviso foi para a fila do WhatsApp."}
      </p>
    );
  }

  if (s.status === "descartada") {
    return (
      <form action={alterarStatusSugestao} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={s.id} />
        <input type="hidden" name="para" value="pendente" />
        <span className="text-sm text-muted-foreground">Descartada.</span>
        <BotaoEnvio variant="outline" size="sm" pendente="Reabrindo…">
          Reabrir
        </BotaoEnvio>
      </form>
    );
  }

  return (
    <div className="mt-1 flex flex-col gap-3">
      {s.tipo === "novo_equipamento" ? (
        disponiveis.length > 0 ? (
          <form action={atenderSugestao} className="flex flex-col gap-2 rounded-xl bg-concreto p-3 sm:flex-row sm:items-end">
            <input type="hidden" name="id" value={s.id} />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <label htmlFor={`equipamento-${s.id}`} className="text-sm font-medium">
                A loja passou a ter? Ligue ao equipamento cadastrado
              </label>
              <select
                id={`equipamento-${s.id}`}
                name="equipamentoId"
                required
                defaultValue=""
                className="h-10 w-full rounded-xl border border-input bg-card px-3 text-base outline-none focus-visible:border-laranja focus-visible:ring-3 focus-visible:ring-laranja/35 md:text-sm"
              >
                <option value="" disabled>
                  Escolha o equipamento…
                </option>
                {disponiveis.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome} ({e.categoria})
                  </option>
                ))}
              </select>
            </div>
            <BotaoEnvio variant="terra" pendente="Ligando…">
              {s.querAviso ? "Ligar e avisar o cliente" : "Ligar"}
            </BotaoEnvio>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Cadastre o equipamento e deixe-o disponível para ligar a sugestão a ele.</p>
        )
      ) : (
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {s.equipamento && (s.equipamento.ativo ? <Situacao disponivel={s.equipamento.disponivel} /> : <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">Desativado</span>)}
          Fica atendida sozinha quando o equipamento voltar a ficar disponível{s.querAviso ? ", e o cliente recebe o aviso" : ""}.
        </p>
      )}
      <form action={alterarStatusSugestao}>
        <input type="hidden" name="id" value={s.id} />
        <input type="hidden" name="para" value="descartada" />
        <BotaoEnvio variant="ghost" size="sm" pendente="Descartando…">
          Descartar
        </BotaoEnvio>
      </form>
    </div>
  );
}
