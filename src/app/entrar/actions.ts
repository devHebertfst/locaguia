"use server";

import { redirect } from "next/navigation";
import { destinoSeguro } from "@/lib/auth/regras";
import { env } from "@/lib/env";
import { criarClienteSupabase } from "@/lib/supabase/servidor";

export async function entrarComGoogle(formData: FormData) {
  const callback = new URL("/auth/callback", env.NEXT_PUBLIC_SITE_URL);
  callback.searchParams.set("proximo", destinoSeguro(formData.get("proximo")));

  const supabase = await criarClienteSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });
  if (error || !data.url) {
    console.error("Falha ao iniciar o login com Google", error);
    redirect("/entrar?erro=falha");
  }
  redirect(data.url);
}

export async function sair() {
  const supabase = await criarClienteSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
