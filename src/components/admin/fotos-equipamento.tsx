"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { moverFoto, prepararEnvioFoto, registrarFoto, removerFoto } from "@/app/admin/equipamentos/actions";
import { BotaoEnvio } from "@/components/admin/botao-envio";
import { buttonVariants } from "@/components/ui/button";
import type { FotoPainel } from "@/lib/equipamentos/consultas";
import { LIMITES_EQUIPAMENTO } from "@/lib/equipamentos/validacao";
import { cn } from "@/lib/utils";

type Props = {
  equipamentoId: string;
  nome: string;
  fotos: FotoPainel[];
  // null quando o servidor não tem a chave do Storage configurada
  storage: { url: string; chave: string; bucket: string } | null;
};

type Envio = { arquivo: string; situacao: "enviando" | "ok" | "erro"; mensagem?: string };

export function FotosEquipamento({ equipamentoId, nome, fotos, storage }: Props) {
  const router = useRouter();
  const entradaRef = useRef<HTMLInputElement>(null);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const enviando = envios.some((e) => e.situacao === "enviando");
  const vagas = LIMITES_EQUIPAMENTO.fotos - fotos.length;

  async function enviar(arquivos: File[]) {
    if (!storage || arquivos.length === 0) return;
    const fila = arquivos.slice(0, vagas);
    setEnvios(fila.map((f) => ({ arquivo: f.name, situacao: "enviando" })));
    const bucket = createClient(storage.url, storage.chave, { auth: { persistSession: false } }).storage.from(storage.bucket);

    // Uma de cada vez: mantém a ordem escolhida e não sobrecarrega 3G/4G.
    for (const [i, arquivo] of fila.entries()) {
      const falhar = (mensagem: string) =>
        setEnvios((atual) => atual.map((e, j) => (j === i ? { ...e, situacao: "erro", mensagem } : e)));
      try {
        const imagem = await reduzirFoto(arquivo);
        const preparo = await prepararEnvioFoto(equipamentoId, imagem.type === "image/webp" ? "webp" : "jpg");
        if (!preparo.ok) {
          falhar(preparo.mensagem);
          continue;
        }
        const { error } = await bucket.uploadToSignedUrl(preparo.caminho, preparo.token, imagem, {
          contentType: imagem.type,
          cacheControl: "31536000",
        });
        if (error) {
          falhar("O envio falhou. Confira a internet e tente de novo.");
          continue;
        }
        const registro = await registrarFoto(equipamentoId, preparo.caminho);
        if (!registro.ok) {
          falhar(registro.mensagem ?? "Não foi possível salvar a foto.");
          continue;
        }
        setEnvios((atual) => atual.map((e, j) => (j === i ? { ...e, situacao: "ok" } : e)));
      } catch (erro) {
        falhar(erro instanceof ErroImagem ? erro.message : "Não foi possível enviar esta foto.");
      }
    }
    setEnvios((atual) => atual.filter((e) => e.situacao === "erro"));
    router.refresh();
  }

  return (
    <section aria-labelledby="titulo-fotos" className="flex flex-col gap-5 rounded-2xl bg-white p-5 ring-1 ring-terra/8 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="titulo-fotos" className="text-2xl font-semibold">
            Fotos
          </h2>
          <p className="text-sm text-muted-foreground">
            A primeira é a capa no catálogo. Até {LIMITES_EQUIPAMENTO.fotos} fotos; o celular reduz cada uma antes de enviar.
          </p>
        </div>
        {storage && vagas > 0 && (
          <>
            <input
              ref={entradaRef}
              id="enviar-fotos"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={enviando}
              onChange={(e) => {
                const arquivos = [...(e.target.files ?? [])];
                e.target.value = "";
                void enviar(arquivos);
              }}
            />
            <label
              htmlFor="enviar-fotos"
              className={cn(
                buttonVariants({ variant: "terra" }),
                "focus-within:outline-2",
                enviando && "pointer-events-none opacity-60",
              )}
            >
              {enviando ? <LoaderCircle aria-hidden className="animate-spin" /> : <ImagePlus aria-hidden />}
              {enviando ? "Enviando…" : "Adicionar fotos"}
            </label>
          </>
        )}
      </div>

      {!storage && (
        <p className="rounded-xl bg-pessego/70 p-4 text-sm">
          O envio de fotos ainda não está ligado: falta configurar a chave secreta do Supabase
          (<code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code>) no servidor.
        </p>
      )}

      {envios.length > 0 && (
        <ul aria-live="polite" className="flex flex-col gap-2 text-sm">
          {envios.map((e, i) => (
            <li
              key={`${e.arquivo}-${i}`}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2",
                e.situacao === "erro" ? "bg-destructive/8 text-destructive" : "bg-concreto",
              )}
            >
              {e.situacao === "enviando" && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
              <span className="truncate font-medium">{e.arquivo}</span>
              <span className="shrink-0">{e.situacao === "erro" ? `: ${e.mensagem}` : e.situacao === "ok" ? ": enviada" : ""}</span>
            </li>
          ))}
        </ul>
      )}

      {fotos.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-terra/15 p-6 text-center text-muted-foreground">
          Nenhuma foto ainda. Sem foto, o catálogo mostra um quadro com uma ferramenta desenhada.
        </p>
      ) : (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {fotos.map((foto, i) => (
            <li key={foto.id} className="flex flex-col gap-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-concreto">
                <Image src={foto.url} alt={`${nome}, foto ${i + 1}`} fill sizes="(min-width: 1024px) 20vw, 45vw" className="object-cover" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-terra px-2.5 py-1 text-xs font-semibold text-white">Capa</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <form action={moverFoto}>
                    <input type="hidden" name="fotoId" value={foto.id} />
                    <input type="hidden" name="direcao" value="antes" />
                    <BotaoEnvio variant="ghost" size="icon-sm" disabled={i === 0} aria-label={`Mover foto ${i + 1} para antes`}>
                      <ArrowLeft aria-hidden />
                    </BotaoEnvio>
                  </form>
                  <form action={moverFoto}>
                    <input type="hidden" name="fotoId" value={foto.id} />
                    <input type="hidden" name="direcao" value="depois" />
                    <BotaoEnvio
                      variant="ghost"
                      size="icon-sm"
                      disabled={i === fotos.length - 1}
                      aria-label={`Mover foto ${i + 1} para depois`}
                    >
                      <ArrowRight aria-hidden />
                    </BotaoEnvio>
                  </form>
                </div>
                <RemoverFoto fotoId={foto.id} numero={i + 1} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// Remover pede um segundo toque, no próprio botão, em vez de um diálogo.
function RemoverFoto({ fotoId, numero }: { fotoId: string; numero: number }) {
  const [confirmando, setConfirmando] = useState(false);
  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        aria-label={`Remover foto ${numero}`}
        className={buttonVariants({ variant: "ghost", size: "icon-sm", className: "text-destructive" })}
      >
        <Trash2 aria-hidden />
      </button>
    );
  }
  return (
    <form action={removerFoto} className="flex items-center gap-1">
      <input type="hidden" name="fotoId" value={fotoId} />
      <button type="button" onClick={() => setConfirmando(false)} className="px-1 text-xs text-muted-foreground hover:text-foreground">
        Cancelar
      </button>
      <BotaoEnvio variant="destructive" size="xs" pendente="Removendo…" autoFocus>
        Remover
      </BotaoEnvio>
    </form>
  );
}

class ErroImagem extends Error {}

// Reduz a foto para no máximo 1600 px no lado maior e converte para WebP
// (JPEG onde o navegador não gera WebP, como o Safari antigo). Foto de
// celular cai de 4–8 MB para algo perto de 200–400 KB.
async function reduzirFoto(arquivo: File): Promise<Blob> {
  if (!arquivo.type.startsWith("image/")) throw new ErroImagem("Este arquivo não é uma imagem.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  } catch {
    throw new ErroImagem("Formato não suportado. Envie em JPG, PNG ou WebP.");
  }
  const escala = Math.min(1, LIMITES_EQUIPAMENTO.ladoFoto / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);
  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura;
  tela.getContext("2d")!.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();
  const gerar = (tipo: string) => new Promise<Blob | null>((ok) => tela.toBlob(ok, tipo, 0.82));
  let blob = await gerar("image/webp");
  if (blob?.type !== "image/webp") blob = await gerar("image/jpeg");
  if (!blob) throw new ErroImagem("Não foi possível converter a foto.");
  return blob;
}
