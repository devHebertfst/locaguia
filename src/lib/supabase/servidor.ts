import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

// Cliente do Supabase Auth que lê e grava a sessão nos cookies do pedido.
// Só serve para autenticação: os dados passam pelo Drizzle (`getDb()`).
export async function criarClienteSupabase() {
  const loja = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.supabaseChavePublica, {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) loja.set(name, value, options);
        } catch {
          // Server Components não podem gravar cookies. O proxy renova a
          // sessão nas rotas /admin, então dá para ignorar aqui.
        }
      },
    },
  });
}
