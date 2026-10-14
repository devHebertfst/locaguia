"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { adicionarMembro, type EstadoEquipe } from "@/app/admin/equipe/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DESCRICAO_PAPEL, LIMITES_EQUIPE, ROTULO_PAPEL } from "@/lib/equipe/regras";

const estadoInicial: EstadoEquipe = { status: "inicial" };
const PAPEIS = ["funcionario", "admin"] as const;

export function FormularioMembro() {
  const [estado, acao, salvando] = useActionState(adicionarMembro, estadoInicial);
  // Campos controlados: com erro, o que foi digitado continua no formulário.
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<(typeof PAPEIS)[number]>("funcionario");
  const nomeRef = useRef<HTMLInputElement>(null);
  const erros = estado.status === "erro" ? (estado.erros ?? {}) : {};

  useEffect(() => {
    if (estado.status !== "ok") return;
    // Cadastro feito: limpa para o próximo.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reação ao resultado da action
    setNome("");
    setEmail("");
    setPapel("funcionario");
    nomeRef.current?.focus();
  }, [estado]);

  return (
    <form action={acao} noValidate className="flex flex-col gap-5 rounded-2xl bg-white p-5 ring-1 ring-terra/8 sm:p-7">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">Adicionar à equipe</h2>
        <p className="text-sm text-muted-foreground">
          Use o e-mail da conta Google da pessoa. Ela entra em /entrar com essa conta.
        </p>
      </div>

      {estado.status === "erro" && estado.mensagem && (
        <p role="alert" className="rounded-xl bg-destructive/8 p-3 text-sm font-medium text-destructive ring-1 ring-destructive/30">
          {estado.mensagem}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="membro-nome" rotulo="Nome" erro={erros.nome}>
          <Input
            ref={nomeRef}
            id="membro-nome"
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={LIMITES_EQUIPE.nome.max}
            autoComplete="off"
            aria-invalid={Boolean(erros.nome)}
            aria-describedby={erros.nome ? "erro-membro-nome" : undefined}
          />
        </Campo>
        <Campo id="membro-email" rotulo="E-mail da conta Google" erro={erros.email}>
          <Input
            id="membro-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(erros.email)}
            aria-describedby={erros.email ? "erro-membro-email" : undefined}
          />
        </Campo>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">Papel</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PAPEIS.map((p) => (
            <label key={p} className="flex cursor-pointer items-start gap-3 rounded-xl bg-concreto p-4 has-[:checked]:ring-2 has-[:checked]:ring-laranja-escuro">
              <input
                type="radio"
                name="papel"
                value={p}
                checked={papel === p}
                onChange={() => setPapel(p)}
                className="mt-0.5 size-4 shrink-0 accent-[#a9550a]"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{ROTULO_PAPEL[p]}</span>
                <span className="text-sm text-muted-foreground">{DESCRICAO_PAPEL[p]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={salvando}>
          {salvando ? "Adicionando…" : "Adicionar"}
        </Button>
        {estado.status === "ok" && (
          <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-[#1d6b34]">
            <CheckCircle2 aria-hidden className="size-4 shrink-0" />
            {estado.mensagem}
          </p>
        )}
      </div>
    </form>
  );
}

function Campo({ id, rotulo, erro, children }: { id: string; rotulo: string; erro?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      {children}
      {erro && (
        <p id={`erro-${id}`} className="text-sm font-medium text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
