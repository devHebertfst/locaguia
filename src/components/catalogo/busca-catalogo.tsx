import Form from "next/form";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TAMANHO_MAXIMO_BUSCA } from "@/lib/catalogo/filtros";

type Props = {
  buscaAtual?: string;
  categoriaAtual?: string;
};

export function BuscaCatalogo({ buscaAtual, categoriaAtual }: Props) {
  return (
    <Form action="/" className="flex gap-2" role="search">
      <label htmlFor="busca" className="sr-only">
        Buscar equipamento
      </label>
      <Input
        id="busca"
        name="busca"
        type="search"
        defaultValue={buscaAtual}
        maxLength={TAMANHO_MAXIMO_BUSCA}
        placeholder="Buscar por nome, uso ou categoria"
        className="h-10"
      />
      {categoriaAtual && <input type="hidden" name="categoria" value={categoriaAtual} />}
      <Button type="submit" className="h-10" aria-label="Buscar">
        <Search aria-hidden />
        <span className="hidden sm:inline">Buscar</span>
      </Button>
    </Form>
  );
}
