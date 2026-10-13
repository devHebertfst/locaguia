import { cn } from "@/lib/utils";

// Marca do LocaGuia: o tambor da betoneira visto de lado, com a boca
// inclinada, ao lado do nome em Cabin.
// `compacta`: menor no celular, para caber ao lado do menu; abaixo de 380 px
// fica só o símbolo.
export function Marca({ className, compacta }: { className?: string; compacta?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight",
        compacta && "max-sm:gap-1.5 max-sm:text-base",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7 shrink-0", compacta && "max-sm:size-6")}>
        <path
          d="M6.5 22.5c-2.6-4.4-1.3-10.6 3.4-14.1l5.6-4.1c1.2-.9 2.9-.6 3.7.6l7.3 10.7c.8 1.2.5 2.9-.7 3.7l-5.7 3.9c-4.8 3.3-11 2.2-13.6-.7Z"
          fill="#f1933c"
        />
        <path d="m11.2 9.6 8.6 12.6M15.2 6.8l8.6 12.6" stroke="#241d17" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
        <path d="M5 27.5h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className={cn(compacta && "max-[379px]:sr-only")}>
        Loca<span className="text-laranja">Guia</span>
      </span>
    </span>
  );
}
