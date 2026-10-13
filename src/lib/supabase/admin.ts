import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Cliente com a chave secreta: só o servidor usa, e só para o Storage das
// fotos (o navegador não tem permissão de escrita no bucket).
export function clienteStorage() {
  const chave = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) return null;
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabase.storage.from(env.SUPABASE_BUCKET_FOTOS);
}

export function envioDeFotosConfigurado(): boolean {
  return Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
}
