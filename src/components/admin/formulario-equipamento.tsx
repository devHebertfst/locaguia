"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { salvarEquipamento, type EstadoEquipamento } from "@/app/admin/equipamentos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LIMITES_EQUIPAMENTO } from "@/lib/equipamentos/validacao";

type Valores = { nome: string; categoria: string; descricao: string; disponivel: boolean };

type Props = {
  id?: string;
  valores?: Valores;
  categorias: string[];
};

const estadoInicial: EstadoEquipamento = { status: "inicial" };
const vazio: Valores = { nome: "", categoria: "", descricao: "", disponivel: true };

export function FormularioEquipamento({ id, valores = vazio, categorias }: Props) {
  const [estado, acao, salvando] = useActionState(salvarEquipamento, estadoInicial);
  // Campos controlados: o React limpa formulários não controlados a cada
  // envio, e a pessoa perderia o que digitou quando houver erro.
  const [campos, setCampos] = useState(valores);
  const [alterado, setAlterado] = useState(false);
  const erros = estado.status === "erro" ? (estado.erros ?? {}) : {};
  const mudar = <K extends keyof Valores>(campo: K, valor: Valores[K]) => {
    setCampos((c) => ({ ...c, [campo]: valor }));
    setAlterado(true);
  };

  return (
    <form
      action={(formData) => {
        setAlterado(false);
        acao(formData);
      }}
      noValidate
      className="flex flex-col gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/8 sm:p-7"
    >
      {id && <input type="hidden" name="id" value={id} />}
      <h2 className="text-2xl font-semibold">Dados do equipamento</h2>

      {estado.status === "erro" && estado.mensagem && (
        <p role="alert" className="rounded-xl bg-destructive/8 p-3 text-sm font-medium text-destructive ring-1 ring-destructive/30">
          {estado.mensagem}
        </p>
      )}

      <Campo id="nome" rotulo="Nome" erro={erros.nome} dica="Como o cliente procura. Ex.: Betoneira 400 litros">
        <Input
          id="nome"
          name="nome"
          value={campos.nome}
          onChange={(e) => mudar("nome", e.target.value)}
          maxLength={LIMITES_EQUIPAMENTO.nome.max}
          autoComplete="off"
          aria-invalid={Boolean(erros.nome)}
          aria-describedby="dica-nome erro-nome"
        />
      </Campo>

      <Campo id="categoria" rotulo="Categoria" erro={erros.categoria} dica="Escolha uma existente ou digite uma nova.">
        <Input
          id="categoria"
          name="categoria"
          list="categorias-existentes"
          value={campos.categoria}
          onChange={(e) => mudar("categoria", e.target.value)}
          maxLength={LIMITES_EQUIPAMENTO.categoria.max}
          autoComplete="off"
          aria-invalid={Boolean(erros.categoria)}
          aria-describedby="dica-categoria erro-categoria"
        />
        <datalist id="categorias-existentes">
          {categorias.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Campo>

      <Campo
        id="descricao"
        rotulo="Descrição"
        erro={erros.descricao}
        dica="Para que serve, potência, tamanho, o que acompanha. O assistente usa este texto para recomendar."
      >
        <Textarea
          id="descricao"
          name="descricao"
          rows={5}
          value={campos.descricao}
          onChange={(e) => mudar("descricao", e.target.value)}
          maxLength={LIMITES_EQUIPAMENTO.descricao.max}
          aria-invalid={Boolean(erros.descricao)}
          aria-describedby="dica-descricao erro-descricao"
        />
      </Campo>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-concreto p-4">
        <input
          type="checkbox"
          name="disponivel"
          checked={campos.disponivel}
          onChange={(e) => mudar("disponivel", e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-[#a9550a]"
        />
        <span className="flex flex-col gap-0.5">
          <span className="font-medium">Disponível para alugar agora</span>
          <span className="text-sm text-muted-foreground">
            Indisponível continua no catálogo, marcado, e o assistente não recomenda.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={salvando}>
          {salvando ? "Salvando…" : id ? "Salvar alterações" : "Cadastrar equipamento"}
        </Button>
        {estado.status === "ok" && !alterado && (
          <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-[#7ed99a]">
            <CheckCircle2 aria-hidden className="size-4" />
            {estado.mensagem}
          </p>
        )}
      </div>
    </form>
  );
}

function Campo({
  id,
  rotulo,
  dica,
  erro,
  children,
}: {
  id: string;
  rotulo: string;
  dica?: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      {children}
      {dica && (
        <p id={`dica-${id}`} className="text-sm text-muted-foreground">
          {dica}
        </p>
      )}
      {erro && (
        <p id={`erro-${id}`} className="text-sm font-medium text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
