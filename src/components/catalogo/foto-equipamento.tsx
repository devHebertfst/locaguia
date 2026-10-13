import Image from "next/image";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

// Foto em proporção 4:3; sem foto, mostra um ícone no lugar.
export function FotoEquipamento({ src, alt, sizes, className, priority }: Props) {
  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden bg-muted", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <Wrench aria-hidden className="size-1/4 max-w-10" />
          <span className="sr-only">Sem foto</span>
        </div>
      )}
    </div>
  );
}
