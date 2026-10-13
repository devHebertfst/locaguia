import "server-only";
import { ApiError, GoogleGenAI, type Content } from "@google/genai";
import { env } from "@/lib/env";
import { esquemaRespostaModelo } from "./nucleo";

let cliente: GoogleGenAI | undefined;

function obterCliente(): GoogleGenAI {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY não configurada");
  cliente ??= new GoogleGenAI({ apiKey: env.GEMINI_API_KEY, httpOptions: { timeout: 25_000 } });
  return cliente;
}

// Sobrecarga (503), limite de cota (429) e falhas de rede valem nova tentativa.
function temporario(erro: unknown): boolean {
  if (erro instanceof ApiError) return erro.status === 429 || erro.status >= 500;
  return true;
}

async function chamar(modelo: string, sistema: string, historico: Content[]) {
  const resposta = await obterCliente().models.generateContent({
    model: modelo,
    contents: historico,
    config: {
      systemInstruction: sistema,
      responseMimeType: "application/json",
      responseJsonSchema: esquemaRespostaModelo,
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  });
  const texto = resposta.text;
  if (!texto) throw new Error(`Resposta vazia (${resposta.candidates?.[0]?.finishReason ?? "sem motivo"})`);
  return texto;
}

// Gera a resposta (JSON em texto). Tenta o modelo principal duas vezes e depois
// o modelo reserva. Lança erro se todos falharem.
export async function gerarResposta(sistema: string, historico: Content[]): Promise<string> {
  const tentativas = [env.GEMINI_MODEL, env.GEMINI_MODEL, env.GEMINI_MODEL_RESERVA];
  let ultimoErro: unknown;
  for (const [i, modelo] of tentativas.entries()) {
    try {
      return await chamar(modelo, sistema, historico);
    } catch (erro) {
      ultimoErro = erro;
      console.warn(`[assistente] tentativa ${i + 1} (${modelo}) falhou:`, String(erro).slice(0, 300));
      if (!temporario(erro)) break;
      if (i === 0) await new Promise((r) => setTimeout(r, 800));
    }
  }
  throw ultimoErro;
}
