// Celular brasileiro: DDD válido + 9 + 8 dígitos. Guardado em E.164 (+55DD9XXXXXXXX).

const DDDS_VALIDOS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

// Aceita o número como o cliente digitar: "(11) 91234-5678", "11912345678",
// "+55 11 91234-5678", "011 91234 5678". Retorna null se não for celular válido.
export function normalizarCelular(entrada: string): string | null {
  let digitos = entrada.replace(/\D/g, "");
  if (digitos.length === 13 && digitos.startsWith("55")) digitos = digitos.slice(2);
  if (digitos.length === 12 && digitos.startsWith("0")) digitos = digitos.slice(1);
  if (digitos.length !== 11) return null;
  if (!DDDS_VALIDOS.has(Number(digitos.slice(0, 2)))) return null;
  if (digitos[2] !== "9") return null;
  return `+55${digitos}`;
}

// "+5511912345678" -> "(11) 91234-5678"
export function formatarCelular(e164: string): string {
  const d = e164.replace(/^\+55/, "");
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Máscara enquanto o cliente digita: "11912" -> "(11) 912"
export function mascararCelular(entrada: string): string {
  const d = entrada.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
