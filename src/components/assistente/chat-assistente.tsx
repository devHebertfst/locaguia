"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight, ArrowUp, Package, RotateCcw, Sparkles } from "lucide-react";
import { perguntarAssistente } from "@/app/assistente/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  LIMITES_ASSISTENTE,
  textoDoAssistenteParaHistorico,
  type ItemRecomendado,
  type MensagemChat,
  type RespostaAssistente,
} from "@/lib/assistente/nucleo";
import { hrefOrcamento } from "@/lib/orcamento/params";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string) => void };
  }
}

type Item =
  | { papel: "cliente"; texto: string }
  | { papel: "assistente"; resposta: RespostaAssistente }
  | { papel: "erro"; texto: string };

// Exemplos que o cliente toca e já envia: o primeiro passo custa um toque.
const EXEMPLOS = [
  "Quero trocar o piso da sala por porcelanato",
  "Vou fazer uma calçada de concreto",
  "Preciso quebrar uma parede de tijolo",
  "Vou lixar e pintar as paredes de casa",
];

const CHAVE_SESSAO = "locaguia:assistente";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function historico(itens: Item[]): MensagemChat[] {
  return itens.flatMap((i): MensagemChat[] =>
    i.papel === "cliente"
      ? [{ papel: "cliente", texto: i.texto }]
      : i.papel === "assistente"
        ? [{ papel: "assistente", texto: textoDoAssistenteParaHistorico(i.resposta) }]
        : [],
  );
}

export function ChatAssistente() {
  const [itens, setItens] = useState<Item[]>([]);
  const [texto, setTexto] = useState("");
  const [pendente, iniciar] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const entradaRef = useRef<HTMLTextAreaElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const restaurado = useRef(false);

  // A conversa sobrevive a ir no detalhe de um equipamento e voltar.
  useEffect(() => {
    try {
      const salvo = sessionStorage.getItem(CHAVE_SESSAO);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage só existe no navegador
      if (salvo) setItens(JSON.parse(salvo) as Item[]);
    } catch {}
    restaurado.current = true;
  }, []);

  useEffect(() => {
    if (!restaurado.current) return;
    try {
      sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(itens.filter((i) => i.papel !== "erro")));
    } catch {}
    if (itens.length) fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [itens]);

  function enviar(pergunta: string) {
    const limpa = pergunta.trim();
    if (!limpa || pendente) return;
    const token = formRef.current
      ? String(new FormData(formRef.current).get("cf-turnstile-response") ?? "")
      : "";
    const anteriores = itens.filter((i) => i.papel !== "erro");
    const novos: Item[] = [...anteriores, { papel: "cliente", texto: limpa }];
    setItens(novos);
    setTexto("");

    iniciar(async () => {
      let resultado: Awaited<ReturnType<typeof perguntarAssistente>>;
      try {
        resultado = await perguntarAssistente(historico(novos), token);
      } catch {
        resultado = { ok: false, erro: "indisponivel", mensagem: "Sem conexão. Confira a internet e tente de novo." };
      }
      if (resultado.ok) {
        setItens([...novos, { papel: "assistente", resposta: resultado.resposta }]);
      } else {
        // Devolve o texto para o campo: o cliente não precisa digitar de novo.
        setItens([...anteriores, { papel: "erro", texto: resultado.mensagem }]);
        setTexto(limpa);
        window.turnstile?.reset();
      }
    });
  }

  function novaConversa() {
    setItens([]);
    setTexto("");
    entradaRef.current?.focus();
  }

  function tentarDeNovo() {
    // Tira a última troca (pergunta fora do assunto) e devolve o foco ao campo.
    setItens((atual) => atual.slice(0, -2));
    entradaRef.current?.focus();
  }

  const vazio = itens.length === 0;

  return (
    <div className="flex flex-1 flex-col gap-4">
      {TURNSTILE_SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      )}

      {vazio ? (
        <section aria-labelledby="exemplos" className="flex flex-col gap-3">
          <h2 id="exemplos" className="text-sm font-medium text-muted-foreground">
            Toque em um exemplo ou escreva com suas palavras:
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {EXEMPLOS.map((exemplo) => (
              <li key={exemplo}>
                <button
                  type="button"
                  onClick={() => enviar(exemplo)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-foreground/40"
                >
                  {exemplo}
                  <ArrowRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="flex items-center justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={novaConversa}>
            <RotateCcw aria-hidden />
            Nova conversa
          </Button>
        </div>
      )}

      <ol aria-live="polite" aria-label="Conversa" className="flex flex-col gap-4">
        {itens.map((item, i) => (
          <li key={i}>
            {item.papel === "cliente" ? (
              <p className="ml-auto w-fit max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-background">
                {item.texto}
              </p>
            ) : item.papel === "erro" ? (
              <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {item.texto}
              </p>
            ) : (
              <Resposta resposta={item.resposta} onTentarDeNovo={tentarDeNovo} />
            )}
          </li>
        ))}
        {pendente && (
          <li aria-label="O assistente está respondendo">
            <p className="flex w-fit items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
              <Sparkles aria-hidden className="size-4 animate-pulse" />
              Procurando no catálogo…
            </p>
          </li>
        )}
      </ol>
      <div ref={fimRef} />

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
        className="sticky bottom-0 -mx-4 mt-auto flex flex-col gap-2 border-t bg-background/95 px-4 pb-4 pt-3 backdrop-blur"
      >
        {TURNSTILE_SITE_KEY && vazio && (
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-language="pt-br" data-size="flexible" />
        )}
        <div className="flex items-end gap-2">
          <label htmlFor="pergunta" className="sr-only">
            Descreva o serviço que você vai fazer
          </label>
          <textarea
            ref={entradaRef}
            id="pergunta"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar(texto);
              }
            }}
            rows={1}
            maxLength={LIMITES_ASSISTENTE.tamanhoMensagem}
            placeholder={vazio ? "Ex.: vou reformar o banheiro e trocar o azulejo" : "Escreva sua resposta…"}
            className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-input bg-transparent px-3 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="submit" size="icon" className="size-11 rounded-xl" disabled={pendente || !texto.trim()} aria-label="Enviar">
            <ArrowUp aria-hidden />
          </Button>
        </div>
      </form>
    </div>
  );
}

function Resposta({
  resposta,
  onTentarDeNovo,
}: {
  resposta: RespostaAssistente;
  onTentarDeNovo: () => void;
}) {
  const { tipo, recomendados, indisponiveis, materiais } = resposta;

  return (
    <article className="flex flex-col gap-4">
      <p className="w-fit max-w-[95%] whitespace-pre-line rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5">
        {resposta.mensagem}
      </p>

      {recomendados.length > 0 && (
        <section aria-label="Equipamentos recomendados" className="flex flex-col gap-2">
          <ul className="flex flex-col gap-2">
            {recomendados.map((e) => (
              <CartaoRecomendado key={e.id} item={e} />
            ))}
          </ul>
        </section>
      )}

      {recomendados.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Link
            href={hrefOrcamento({
              equipamentos: recomendados.map((e) => e.id),
              servico: resposta.servicoResumo,
              materiais,
            })}
            className={buttonVariants({ size: "lg", className: "h-11 w-full sm:w-fit" })}
          >
            {recomendados.length === 1
              ? "Pedir orçamento deste equipamento"
              : `Pedir orçamento destes ${recomendados.length} equipamentos`}
            <ArrowRight aria-hidden />
          </Link>
          <p className="text-xs text-muted-foreground">
            Sem compromisso: você revisa o pedido e a locadora responde com preço e condições.
          </p>
        </div>
      )}

      {materiais.length > 0 && tipo !== "pergunta" && (
        <section className="rounded-xl border border-dashed p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Package aria-hidden className="size-4 text-muted-foreground" />
            Materiais que você provavelmente vai comprar
          </h3>
          <ul className="mt-2 grid gap-x-4 gap-y-1 text-sm text-muted-foreground sm:grid-cols-2">
            {materiais.map((m) => (
              <li key={m} className="before:mr-2 before:content-['•']">
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}

      {indisponiveis.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Também serviria, mas está indisponível no momento:
          </h3>
          <ul className="flex flex-col gap-2">
            {indisponiveis.map((e) => (
              <CartaoRecomendado key={e.id} item={e} indisponivel />
            ))}
          </ul>
        </section>
      )}

      {tipo === "sem_equipamento" && (
        <div className="flex flex-col gap-2 rounded-xl border p-4 text-sm">
          <p>
            {resposta.equipamentoFaltante
              ? `Não temos "${resposta.equipamentoFaltante}" para alugar agora.`
              : "Não encontramos um equipamento para esse serviço no catálogo."}{" "}
            Você pode descrever o serviço de outro jeito ou ver tudo o que temos.
          </p>
          <Link href="/" className="w-fit font-medium underline underline-offset-4">
            Ver o catálogo completo
          </Link>
        </div>
      )}

      {tipo === "fora_do_escopo" && (
        <Button type="button" variant="outline" className="w-fit" onClick={onTentarDeNovo}>
          <RotateCcw aria-hidden />
          Tentar de novo
        </Button>
      )}
    </article>
  );
}

function CartaoRecomendado({ item, indisponivel }: { item: ItemRecomendado; indisponivel?: boolean }) {
  return (
    <li>
      <Link
        href={`/equipamentos/${item.id}`}
        className={cn(
          "flex flex-col gap-1 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/40",
          indisponivel && "bg-muted/40 opacity-80",
        )}
      >
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.categoria}</span>
        <span className="font-semibold">{item.nome}</span>
        {item.motivo && <span className="text-sm text-muted-foreground">{item.motivo}</span>}
      </Link>
    </li>
  );
}
