import { Badge } from "@/components/ui/badge";

export function SeloDisponibilidade({ disponivel }: { disponivel: boolean }) {
  return disponivel ? null : <Badge variant="secondary">Indisponível no momento</Badge>;
}
