// O Vercel Cron chama a rota com "Authorization: Bearer <CRON_SECRET>". Sem
// segredo configurado, a rota fica fechada para todo mundo.
export function cronAutorizado(cabecalho: string | null, segredo: string | undefined): boolean {
  if (!segredo || !cabecalho) return false;
  const esperado = `Bearer ${segredo}`;
  if (cabecalho.length !== esperado.length) return false;
  let diferenca = 0;
  for (let i = 0; i < esperado.length; i++) diferenca |= cabecalho.charCodeAt(i) ^ esperado.charCodeAt(i);
  return diferenca === 0;
}
