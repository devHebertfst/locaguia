import { Suspense } from "react";
import type { Metadata } from "next";
import { AcoesMembro } from "@/components/admin/acoes-membro";
import { FormularioMembro } from "@/components/admin/formulario-membro";
import { exigirUsuario } from "@/lib/auth/sessao";
import { listarEquipe } from "@/lib/equipe/consultas";
import { ROTULO_PAPEL } from "@/lib/equipe/regras";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Equipe" };

export default function EquipePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-medium tracking-[-0.02em]">Equipe</h1>
        <p className="max-w-[70ch] text-muted-foreground">
          Quem pode entrar no painel. Bloquear tira o acesso na hora; o cadastro continua aqui e pode ser liberado de novo.
        </p>
      </div>
      <Suspense fallback={<div aria-busy="true" aria-label="Carregando equipe" className="h-96 animate-pulse rounded-2xl bg-card" />}>
        <Conteudo />
      </Suspense>
    </main>
  );
}

async function Conteudo() {
  const eu = await exigirUsuario(["admin"]);
  const equipe = await listarEquipe();

  return (
    <>
      <ul aria-label="Pessoas da equipe" className="divide-y divide-foreground/8 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8">
        {equipe.map((m) => (
          <li
            key={m.id}
            className={cn("flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5", !m.autorizado && "bg-concreto/60")}
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className={cn("font-heading text-lg font-semibold", !m.autorizado && "text-muted-foreground")}>{m.nome}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", m.papel === "admin" ? "bg-creme text-terra" : "bg-concreto text-muted-foreground")}>
                  {ROTULO_PAPEL[m.papel]}
                </span>
                {!m.autorizado && (
                  <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">Bloqueado</span>
                )}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {m.email}
                {!m.jaEntrou && m.autorizado && " · ainda não entrou"}
              </span>
            </div>
            <AcoesMembro id={m.id} nome={m.nome} papel={m.papel} autorizado={m.autorizado} proprio={m.id === eu.id} />
          </li>
        ))}
      </ul>

      <FormularioMembro />
    </>
  );
}
