// URL pública de uma foto no Supabase Storage (bucket com leitura pública).
export function urlFoto(supabaseUrl: string, bucket: string, caminho: string): string {
  const base = supabaseUrl.replace(/\/+$/, "");
  const partes = caminho.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${partes}`;
}
