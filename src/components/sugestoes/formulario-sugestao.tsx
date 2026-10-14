"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2 } from "lucide-react";
import { enviarSugestao, type EstadoSugestao } from "@/app/sugerir/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LIMITES_SUGESTAO } from "@/lib/sugestoes/validacao";
import { mascararCelular } from "@/lib/telefone";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string) => void };
  }
}

type Props = { turnstileSiteKey?: string; className?: string } & (
  | { tipo: "novo_equipamento"; nomeEquipamentoInicial?: string; motivoInicial?: string }
  | { tipo: "aguardar_disponibilidade"; equipamentoId: string; nomeEquipamento: string }
);

const estadoInicial: EstadoSugestao = { status: "inicial" };

export function FormularioSugestao(props: Props) {
  const { tipo, turnstileSiteKey, className } = props;
  const [estado, acao, enviando] = useActionState(enviarSugestao, estadoInicial);

  // Campos controlados: o React limpa formulários não controlados a cada
  // envio, e o cliente perderia o que digitou quando houver erro.
  const [nomeEquipamento, setNomeEquipamento] = useState(props.tipo === "novo_equipamento" ? (props.nomeEquipamentoInicial ?? "") : "");
  const [motivo, setMotivo] = useState(props.tipo === "novo_equipamento" ? (props.motivoInicial ?? "") : "");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [querAviso, setQuerAviso] = useState(false);

  useEffect(() => {
    // O token do Turnstile vale para um envio só.
    if (estado.status === "erro") window.turnstile?.reset();
  }, [estado]);

  if (estado.status === "ok") {
    return (
      <section aria-live="polite" className={cn("flex flex-col items-start gap-3", className)}>
        <CheckCircle2 aria-hidden className="size-8 text-[#1d8a3a]" />
        <h2 className="text-2xl font-semibold">{tipo === "novo_equipamento" ? "Sugestão enviada" : "Pedido anotado"}</h2>
        <p className="text-terra-2">
          {estado.querAviso
            ? tipo === "novo_equipamento"
              ? "Obrigado! Se a locadora passar a ter este equipamento, você recebe um aviso no WhatsApp."
              : "Assim que ele voltar a ficar disponível, você recebe um aviso no WhatsApp."
            : "Obrigado! A locadora vai ver o seu pedido."}
        </p>
        <Link href="/catalogo" className="text-sm underline underline-offset-4">
          Voltar ao catálogo
        </Link>
      </section>
    );
  }

  const erros = estado.status === "erro" ? (estado.erros ?? {}) : {};
  const id = (campo: string) => `sugestao-${campo}`;

  return (
    <form action={acao} noValidate className={cn("flex flex-col gap-4", className)}>
      {turnstileSiteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}
      <input type="hidden" name="tipo" value={tipo} />
      {props.tipo === "aguardar_disponibilidade" && <input type="hidden" name="equipamentoId" value={props.equipamentoId} />}

      {estado.status === "erro" && estado.mensagem && (
        <p role="alert" className="rounded-xl bg-white p-4 text-sm font-medium text-destructive ring-1 ring-destructive/40">
          {estado.mensagem}
        </p>
      )}

      {tipo === "novo_equipamento" && (
        <Campo id={id("nomeEquipamento")} rotulo="Qual equipamento você procura?" erro={erros.nomeEquipamento}>
          <Input
            id={id("nomeEquipamento")}
            name="nomeEquipamento"
            value={nomeEquipamento}
            onChange={(e) => setNomeEquipamento(e.target.value)}
            maxLength={LIMITES_SUGESTAO.equipamento.max}
            placeholder="Ex.: Rompedor 30 kg"
            autoComplete="off"
            aria-invalid={Boolean(erros.nomeEquipamento)}
            aria-describedby={erros.nomeEquipamento ? `erro-${id("nomeEquipamento")}` : undefined}
          />
        </Campo>
      )}

      <Campo
        id={id("motivo")}
        rotulo={tipo === "novo_equipamento" ? "Para que serviço? (opcional)" : "Para quando você precisa? (opcional)"}
        erro={erros.motivo}
      >
        <Textarea
          id={id("motivo")}
          name="motivo"
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={LIMITES_SUGESTAO.motivo.max}
          placeholder={tipo === "novo_equipamento" ? "Ex.: quebrar uma laje de concreto" : "Ex.: começo da obra na semana que vem"}
          aria-invalid={Boolean(erros.motivo)}
          aria-describedby={erros.motivo ? `erro-${id("motivo")}` : undefined}
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id={id("nome")} rotulo="Nome" erro={erros.nome}>
          <Input
            id={id("nome")}
            name="nome"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={LIMITES_SUGESTAO.nome.max}
            aria-invalid={Boolean(erros.nome)}
            aria-describedby={erros.nome ? `erro-${id("nome")}` : undefined}
          />
        </Campo>
        <Campo id={id("telefone")} rotulo="WhatsApp" erro={erros.telefone}>
          <Input
            id={id("telefone")}
            name="telefone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(11) 91234-5678"
            value={telefone}
            onChange={(e) => setTelefone(mascararCelular(e.target.value))}
            aria-invalid={Boolean(erros.telefone)}
            aria-describedby={erros.telefone ? `erro-${id("telefone")}` : undefined}
          />
        </Campo>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="querAviso"
          checked={querAviso}
          onChange={(e) => setQuerAviso(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-[#a9550a]"
        />
        <span>
          {props.tipo === "novo_equipamento"
            ? "Quero receber um aviso no WhatsApp se a locadora passar a ter este equipamento."
            : `Quero receber um aviso no WhatsApp quando ${props.nomeEquipamento} voltar a ficar disponível.`}
        </span>
      </label>

      {turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-language="pt-br" />}

      <Button type="submit" size="lg" variant={tipo === "novo_equipamento" ? "default" : "terra"} className="w-full sm:w-fit" disabled={enviando}>
        {enviando ? "Enviando…" : tipo === "novo_equipamento" ? "Enviar sugestão" : "Me avise"}
      </Button>
    </form>
  );
}

function Campo({ id, rotulo, erro, children }: { id: string; rotulo: string; erro?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      {children}
      {erro && (
        <p id={`erro-${id}`} className="text-sm text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
