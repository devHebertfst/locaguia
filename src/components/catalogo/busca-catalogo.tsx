import Form from "next/form";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TAMANHO_MAXIMO_BUSCA } from "@/lib/catalogo/filtros";

type Props = {
  buscaAtual?: string;
  categoriaAtual?: string;
};

export function BuscaCatalogo({ buscaAtual, categoriaAtual }: Props) {
  return (
    <Form
      action="/catalogo"
      role="search"
      scroll={false}
      className="flex items-center gap-1.5 rounded-full bg-white p-1.5 ring-1 ring-terra/15 transition-[box-shadow,background-color] focus-within:bg-[#fff4ea] focus-within:ring-2 focus-within:ring-laranja-escuro"
    >
      <Search aria-hidden className="ml-3 size-5 shrink-0 text-muted-foreground" />
      <label htmlFor="busca" className="sr-only">
        Buscar equipamento
      </label>
      <input
        id="busca"
        name="busca"
        type="search"
        defaultValue={buscaAtual}
        maxLength={TAMANHO_MAXIMO_BUSCA}
        placeholder="Ex.: serra, piso, concreto"
        className="h-10 min-w-0 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-[#6b655f] focus-visible:outline-none"
      />
      {categoriaAtual && <input type="hidden" name="categoria" value={categoriaAtual} />}
      <Button type="submit" variant="terra" aria-label="Buscar" className="px-4 sm:px-5">
        <Search aria-hidden className="sm:hidden" />
        <span className="hidden sm:inline">Buscar</span>
      </Button>
    </Form>
  );
}
