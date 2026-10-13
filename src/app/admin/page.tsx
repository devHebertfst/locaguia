import { Suspense } from "react";
import { exigirUsuario } from "@/lib/auth/sessao";

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-8">
      <Suspense fallback={<div aria-busy="true" className="h-16 animate-pulse rounded-lg bg-muted" />}>
        <BoasVindas />
      </Suspense>
    </main>
  );
}

async function BoasVindas() {
  const usuario = await exigirUsuario();
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Olá, {usuario.nome}</h1>
      <p className="text-muted-foreground">
        {usuario.papel === "admin" ? "Você entrou como administrador." : "Você entrou como funcionário."}
      </p>
    </div>
  );
}
