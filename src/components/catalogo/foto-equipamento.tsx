import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

// Foto em proporção 4:3. Sem foto, um quadro em pêssego com a silhueta de uma
// ferramenta, para o catálogo não parecer inacabado.
export function FotoEquipamento({ src, alt, sizes, className, priority }: Props) {
  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden bg-concreto", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-accent">
          <svg viewBox="0 0 48 48" aria-hidden className="size-1/3 max-w-16 text-laranja/70">
            <path
              d="M14 34 31 17m-4-6 10 10m-3-13 4 4a3 3 0 0 1 0 4.2l-3.6 3.6-8.2-8.2 3.6-3.6a3 3 0 0 1 4.2 0ZM14 34l-3.5 3.5a2.5 2.5 0 0 1-3.5-3.5L10.5 30.5 14 34Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="sr-only">Sem foto</span>
        </div>
      )}
    </div>
  );
}
