import type { Metadata } from "next";
import { ChatAssistente } from "@/components/assistente/chat-assistente";
import { TituloPagina } from "@/components/titulo-pagina";

export const metadata: Metadata = {
  title: "Assistente",
  description: "Descreva o serviço que você vai fazer e veja quais equipamentos e materiais vai precisar.",
};

export default function AssistentePage() {
  return (
    <main className="flex flex-1 flex-col bg-concreto">
      <TituloPagina
        titulo="O que você vai fazer?"
        descricao="Conte o serviço e o assistente indica os equipamentos da locadora e os materiais que você vai precisar."
        largura="max-w-3xl"
      />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-8 sm:px-6">
        <ChatAssistente />
      </div>
    </main>
  );
}
