import "server-only";
import { z } from "zod";

const opcional = z
  .string()
  .optional()
  .transform((v) => (v ? v : undefined));

const inteiro = (padrao: number) => z.coerce.number().int().positive().default(padrao);

const esquema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  // Chave pública do Supabase. O nome novo é "publishable"; o antigo, "anon".
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: opcional,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: opcional,
  // Chave secreta (service role): só o painel admin usa, para enviar fotos.
  SUPABASE_SERVICE_ROLE_KEY: opcional,
  SUPABASE_BUCKET_FOTOS: z.string().default("equipamentos"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),

  GEMINI_API_KEY: opcional,
  GEMINI_MODEL: z.string().default("gemini-flash-latest"),

  NEXT_PUBLIC_TURNSTILE_SITE_KEY: opcional,
  TURNSTILE_SECRET_KEY: opcional,

  // Contato da loja e notificação por e-mail: opcionais até existirem.
  WHATSAPP_LOJA: opcional,
  RESEND_API_KEY: opcional,
  EMAIL_REMETENTE: opcional,
  EMAIL_DESTINO: opcional,

  // WhatsApp Cloud API (avisos aos clientes): opcional até existir.
  WHATSAPP_CLOUD_TOKEN: opcional,
  WHATSAPP_CLOUD_PHONE_NUMBER_ID: opcional,
  WHATSAPP_TEMPLATE_IDIOMA: z.string().default("pt_BR"),
  CRON_SECRET: opcional,

  // Limites de uso
  LIMITE_ASSISTENTE_MENSAGENS_CONVERSA: inteiro(20),
  LIMITE_ASSISTENTE_POR_IP_HORA: inteiro(30),
  LIMITE_ASSISTENTE_DIARIO: inteiro(500),
  LIMITE_FORMULARIOS_POR_IP_HORA: inteiro(5),
});

const esquemaComChave = esquema
  .refine(
    (e) => e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || e.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { path: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] },
  )
  .transform((e) => ({
    ...e,
    supabaseChavePublica: (e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      e.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
  }));

export type Env = z.infer<typeof esquemaComChave>;

let cache: Env | undefined;

function carregar(): Env {
  if (cache) return cache;
  const resultado = esquemaComChave.safeParse(process.env);
  if (!resultado.success) {
    const campos = resultado.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Variáveis de ambiente inválidas ou ausentes: ${campos}`);
  }
  cache = resultado.data;
  return cache;
}

// Validação preguiçosa: só falha quando uma variável é usada, para que o
// build e os testes rodem sem todas as credenciais.
export const env = new Proxy({} as Env, {
  get: (_, chave: string) => carregar()[chave as keyof Env],
});
