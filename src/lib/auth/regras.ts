export type Papel = "admin" | "funcionario";

export type ErroLogin = "nao_autorizado" | "falha";

export const MENSAGENS_ERRO_LOGIN: Record<ErroLogin, string> = {
  nao_autorizado:
    "Esta conta Google não tem acesso à área da equipe. Peça ao administrador para liberar o seu e-mail.",
  falha: "Não foi possível entrar. Tente de novo.",
};

export function lerErroLogin(valor: unknown): ErroLogin | undefined {
  return valor === "nao_autorizado" || valor === "falha" ? valor : undefined;
}

// Destino depois do login. Só aceita caminhos dentro de /admin, para que o
// parâmetro não vire um redirecionamento aberto para outro site.
export function destinoSeguro(valor: unknown): string {
  if (typeof valor !== "string") return "/admin";
  if (!/^\/admin(?:[/?#]|$)/.test(valor)) return "/admin";
  if (valor.includes("\\") || valor.includes("//")) return "/admin";
  return valor;
}

export function temPapel(papel: Papel, permitidos?: readonly Papel[]): boolean {
  return !permitidos || permitidos.includes(papel);
}

type CadastroUsuario = { authUserId: string | null; autorizado: boolean };

// Uma conta Google só entra se o e-mail estiver cadastrado e autorizado, e se
// o cadastro ainda não estiver ligado a outra conta do Supabase Auth.
export function podeVincular(
  cadastro: CadastroUsuario | undefined,
  authUserId: string,
): boolean {
  if (!cadastro || !cadastro.autorizado) return false;
  return cadastro.authUserId === null || cadastro.authUserId === authUserId;
}
