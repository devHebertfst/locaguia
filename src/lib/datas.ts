// Datas de calendário no formato "AAAA-MM-DD", sempre no fuso da locadora.

export const FUSO_LOCADORA = "America/Sao_Paulo";

export function hojeNaLocadora(agora: Date = new Date()): string {
  // en-CA formata como AAAA-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_LOCADORA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

export function somarDias(data: string, dias: number): string {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function dataValida(data: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const d = new Date(`${data}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === data;
}

// "2026-10-20" -> "20/10/2026"
export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
