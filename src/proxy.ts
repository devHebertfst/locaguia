import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Renova a sessão do Supabase nas rotas da equipe e manda para o login quem
// não tem sessão. É só uma checagem otimista: cada página e Server Action
// confere o papel do usuário no banco (`exigirUsuario`).
export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (lista) => {
          for (const { name, value } of lista) request.cookies.set(name, value);
          resposta = NextResponse.next({ request });
          for (const { name, value, options } of lista) {
            resposta.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims.sub) {
    const login = new URL("/entrar", request.url);
    login.searchParams.set("proximo", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }
  return resposta;
}

export const config = {
  matcher: ["/admin/:path*"],
};
