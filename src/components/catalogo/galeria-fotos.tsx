"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FotoEquipamento } from "./foto-equipamento";

export function GaleriaFotos({ fotos, nome }: { fotos: string[]; nome: string }) {
  const [atual, setAtual] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <FotoEquipamento
        src={fotos[atual]}
        alt={fotos.length > 1 ? `${nome}, foto ${atual + 1} de ${fotos.length}` : nome}
        sizes="(min-width: 768px) 50vw, 100vw"
        className="rounded-2xl"
        priority
      />
      {fotos.length > 1 && (
        <ul className="flex gap-3 overflow-x-auto p-1">
          {fotos.map((foto, i) => (
            <li key={foto} className="shrink-0">
              <button
                type="button"
                onClick={() => setAtual(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === atual}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-concreto transition",
                  i === atual ? "ring-laranja-escuro" : "ring-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={foto} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
