"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, MessageCircle, X } from "lucide-react";
import { enviarOrcamento, type EstadoOrcamento } from "@/app/orcamento/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OpcaoEquipamento } from "@/lib/catalogo/consultas";
import { LIMITES } from "@/lib/orcamento/validacao";
import { mascararCelular } from "@/lib/telefone";


declare global {
  interface Window {
    turnstile?: { reset: (widget?: string) => void };
  }
}

type Props = {
  disponiveis: OpcaoEquipamento[];
  selecionadosIniciais: string[];
  servicoInicial: string;
  materiais: string[];
  hoje: string;
  turnstileSiteKey?: string;
};

const estadoInicial: EstadoOrcamento = { status: "inicial" };

export function FormularioOrcamento({
  disponiveis,
  selecionadosIniciais,
  servicoInicial,
  materiais,
  hoje,
  turnstileSiteKey,
}: Props) {
  const [estado, acao, enviando] = useActionState(enviarOrcamento, estadoInicial);

  // Campos controlados: o React limpa formulários não controlados depois de
  // cada envio, e o cliente perderia o que digitou quando houver erro.
  const [selecionados, setSelecionados] = useState(selecionadosIniciais);
  const [servico, setServico] = useState(servicoInicial);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [aceitaWhatsapp, setAceitaWhatsapp] = useState(false);

  const porId = useMemo(() => new Map(disponiveis.map((e) => [e.id, e])), [disponiveis]);
  const restantesPorCategoria = useMemo(() => {
    const grupos = new Map<string, OpcaoEquipamento[]>();
    for (const e of disponiveis) {
      if (selecionados.includes(e.id)) continue;
      grupos.set(e.categoria, [...(grupos.get(e.categoria) ?? []), e]);
    }
    return [...grupos];
  }, [disponiveis, selecionados]);

  useEffect(() => {
    // O token do Turnstile vale para um envio só.
    if (estado.status === "erro") window.turnstile?.reset();
  }, [estado]);

  if (estado.status === "ok") {
    return <Confirmacao codigo={estado.codigo} linkWhatsapp={estado.linkWhatsapp} />;
  }

  const erros = estado.status === "erro" ? (estado.erros ?? {}) : {};

  return (
    <form action={acao} noValidate className="flex flex-col gap-8">
      {turnstileSiteKey && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      )}

      {estado.status === "erro" && estado.mensagem && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {estado.mensagem}
        </p>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-lg font-semibold">Equipamentos</legend>
        {selecionados.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {selecionados.map((id) => {
              const equipamento = porId.get(id);
              if (!equipamento) return null;
              return (
                <li key={id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                  <input type="hidden" name="equipamentos" value={id} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{equipamento.nome}</span>
                    <span className="block text-xs text-muted-foreground">{equipamento.categoria}</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover ${equipamento.nome}`}
                    onClick={() => setSelecionados((s) => s.filter((x) => x !== id))}
                  >
                    <X aria-hidden />
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum equipamento escolhido ainda.</p>
        )}

        {restantesPorCategoria.length > 0 && selecionados.length < LIMITES.equipamentos && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adicionar">Adicionar equipamento</Label>
            <select
              id="adicionar"
              value=""
              onChange={(e) => e.target.value && setSelecionados((s) => [...s, e.target.value])}
              aria-invalid={Boolean(erros.equipamentos)}
              aria-describedby={erros.equipamentos ? "erro-equipamentos" : undefined}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
            >
              <option value="">Escolha na lista…</option>
              {restantesPorCategoria.map(([categoria, itens]) => (
                <optgroup key={categoria} label={categoria}>
                  {itens.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}
        <Erro id="erro-equipamentos" mensagem={erros.equipamentos} />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 text-lg font-semibold">Serviço e período</legend>
        <Campo id="servico" rotulo="O que você vai fazer?" erro={erros.servico}>
          <Textarea
            id="servico"
            name="servico"
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            maxLength={LIMITES.servico.max}
            rows={4}
            placeholder="Ex.: vou trocar o piso de uma sala de 20 m² e preciso quebrar o piso antigo."
            aria-invalid={Boolean(erros.servico)}
            aria-describedby={erros.servico ? "erro-servico" : undefined}
          />
        </Campo>
        {materiais.length > 0 && (
          <div className="rounded-lg bg-muted/60 p-3 text-sm">
            <p className="font-medium">Materiais sugeridos pelo assistente</p>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {materiais.map((m) => (
                <li key={m}>
                  {m}
                  <input type="hidden" name="materiais" value={m} />
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="dataInicio" rotulo="Retirada" erro={erros.dataInicio}>
            <Input
              id="dataInicio"
              name="dataInicio"
              type="date"
              min={hoje}
              value={dataInicio}
              onChange={(e) => {
                setDataInicio(e.target.value);
                if (dataFim && e.target.value > dataFim) setDataFim(e.target.value);
              }}
              className="h-10"
              aria-invalid={Boolean(erros.dataInicio)}
              aria-describedby={erros.dataInicio ? "erro-dataInicio" : undefined}
            />
          </Campo>
          <Campo id="dataFim" rotulo="Devolução" erro={erros.dataFim}>
            <Input
              id="dataFim"
              name="dataFim"
              type="date"
              min={dataInicio || hoje}
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="h-10"
              aria-invalid={Boolean(erros.dataFim)}
              aria-describedby={erros.dataFim ? "erro-dataFim" : undefined}
            />
          </Campo>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 text-lg font-semibold">Seus dados</legend>
        <Campo id="nome" rotulo="Nome" erro={erros.nome}>
          <Input
            id="nome"
            name="nome"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={LIMITES.nome.max}
            className="h-10"
            aria-invalid={Boolean(erros.nome)}
            aria-describedby={erros.nome ? "erro-nome" : undefined}
          />
        </Campo>
        <Campo id="telefone" rotulo="WhatsApp" erro={erros.telefone}>
          <Input
            id="telefone"
            name="telefone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(11) 91234-5678"
            value={telefone}
            onChange={(e) => setTelefone(mascararCelular(e.target.value))}
            className="h-10"
            aria-invalid={Boolean(erros.telefone)}
            aria-describedby={erros.telefone ? "erro-telefone" : undefined}
          />
        </Campo>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="aceitaWhatsapp"
            checked={aceitaWhatsapp}
            onChange={(e) => setAceitaWhatsapp(e.target.checked)}
            className="mt-0.5 size-4 accent-foreground"
          />
          <span>
            Aceito receber avisos sobre este pedido no WhatsApp, por exemplo se um equipamento deixar de
            estar disponível.
          </span>
        </label>
      </fieldset>

      {turnstileSiteKey && (
        <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-language="pt-br" />
      )}

      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg" className="h-11 w-full sm:w-auto" disabled={enviando}>
          {enviando ? "Enviando…" : "Pedir orçamento"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Preço e condições são combinados direto com a locadora. Este pedido não é uma reserva.
        </p>
      </div>
    </form>
  );
}

function Campo({
  id,
  rotulo,
  erro,
  children,
}: {
  id: string;
  rotulo: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      {children}
      <Erro id={`erro-${id}`} mensagem={erro} />
    </div>
  );
}

function Erro({ id, mensagem }: { id: string; mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {mensagem}
    </p>
  );
}

function Confirmacao({ codigo, linkWhatsapp }: { codigo: string; linkWhatsapp?: string }) {
  return (
    <section aria-live="polite" className="flex flex-col items-start gap-4 rounded-xl border p-6">
      <CheckCircle2 aria-hidden className="size-8 text-emerald-600" />
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Pedido registrado</h2>
        <p className="text-muted-foreground">
          Código do pedido: <strong className="font-mono text-foreground">{codigo}</strong>
        </p>
      </div>
      {linkWhatsapp ? (
        <>
          <p>Para agilizar, envie o pedido para a locadora pelo WhatsApp. A mensagem já está pronta.</p>
          <a
            href={linkWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#1f8f4e] px-5 font-medium text-white hover:bg-[#1a7a43]"
          >
            <MessageCircle aria-hidden className="size-5" />
            Enviar pelo WhatsApp
          </a>
        </>
      ) : (
        <p>A locadora vai entrar em contato pelo WhatsApp que você informou.</p>
      )}
      <Link href="/" className="text-sm underline underline-offset-4">
        Voltar ao catálogo
      </Link>
    </section>
  );
}
