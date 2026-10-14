"use client";

import { useState, useTransition } from "react";
import { alterarMembro } from "@/app/admin/equipe/actions";
import { Button } from "@/components/ui/button";
import type { Papel } from "@/lib/auth/regras";
import type { MudancaMembro } from "@/lib/equipe/regras";

type Props = { id: string; nome: string; papel: Papel; autorizado: boolean; proprio: boolean };

// Trocar papel e bloquear/liberar. O servidor confere tudo de novo e devolve
// o motivo quando não pode (ex.: último admin); o motivo aparece aqui.
export function AcoesMembro({ id, nome, papel, autorizado, proprio }: Props) {
  const [erro, setErro] = useState<string>();
  const [pendente, iniciar] = useTransition();

  function alterar(mudanca: MudancaMembro) {
    setErro(undefined);
    iniciar(async () => {
      try {
        const resultado = await alterarMembro(id, mudanca);
        if (!resultado.ok) setErro(resultado.mensagem);
      } catch {
        setErro("Não foi possível salvar. Tente de novo.");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {autorizado && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pendente || proprio}
            onClick={() => alterar({ papel: papel === "admin" ? "funcionario" : "admin" })}
          >
            {papel === "admin" ? "Tornar funcionário" : "Tornar administrador"}
          </Button>
        )}
        <Button
          type="button"
          variant={autorizado ? "ghost" : "terra"}
          size="sm"
          disabled={pendente || proprio}
          aria-label={autorizado ? `Bloquear ${nome}` : `Liberar ${nome}`}
          onClick={() => alterar({ autorizado: !autorizado })}
          className={autorizado ? "text-destructive hover:text-destructive" : undefined}
        >
          {autorizado ? "Bloquear acesso" : "Liberar acesso"}
        </Button>
      </div>
      {proprio && <p className="text-xs text-muted-foreground">Esta é a sua conta.</p>}
      {erro && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
