import { NextResponse, type NextRequest } from "next/server";
import { destinoSeguro } from "@/lib/auth/regras";
import { vincularConta } from "@/lib/auth/sessao";
import { criarClienteSupabase } from "@/lib/supabase/servidor";

// Volta do login com Google: troca o código pela sessão e só a mantém aberta
// se o e-mail estiver cadastrado e autorizado em `usuarios`.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const codigo = searchParams.get("code");
  const para = (caminho: string) => NextResponse.redirect(new URL(caminho, request.url));

  if (!codigo) return para("/entrar?erro=falha");

  const supabase = await criarClienteSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(codigo);
  if (error || !data.user.email) {
    console.error("Falha ao concluir o login com Google", error);
    return para("/entrar?erro=falha");
  }

  if (!(await vincularConta(data.user.id, data.user.email))) {
    await supabase.auth.signOut();
    return para("/entrar?erro=nao_autorizado");
  }
  return para(destinoSeguro(searchParams.get("proximo")));
}
