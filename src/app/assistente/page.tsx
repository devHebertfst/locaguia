import type { Metadata } from "next";
import { ChatAssistente } from "@/components/assistente/chat-assistente";

export const metadata: Metadata = {
  title: "Assistente",
  description: "Descreva o serviço que você vai fazer e veja quais equipamentos e materiais vai precisar.",
};

export default function AssistentePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">O que você vai fazer?</h1>
        <p className="text-muted-foreground">
          Conte o serviço e o assistente indica os equipamentos da locadora e os materiais que você vai precisar.
        </p>
      </div>
      <ChatAssistente />
    </main>
  );
}
