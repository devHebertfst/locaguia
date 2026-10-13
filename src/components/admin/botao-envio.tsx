"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type Props = React.ComponentProps<typeof Button> & { pendente?: string };

// Botão de formulário com Server Action: desabilita e troca o texto enquanto
// a ação roda, para a pessoa não clicar duas vezes.
export function BotaoEnvio({ children, pendente, disabled, ...props }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending || undefined} {...props}>
      {pending && pendente ? pendente : children}
    </Button>
  );
}
