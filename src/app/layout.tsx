import type { Metadata, Viewport } from "next";
import { Cabin, Inter } from "next/font/google";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import "./globals.css";

const cabin = Cabin({
  variable: "--font-cabin",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LocaGuia",
    template: "%s | LocaGuia",
  },
  description:
    "Aluguel de equipamentos de construção com ajuda para escolher o que você precisa.",
};

export const viewport: Viewport = {
  themeColor: "#241d17",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${cabin.variable} ${inter.variable} h-full antialiased`}
    >
      {/* Extensões do navegador (ColorZilla, Grammarly) põem atributos no body
          antes de o React carregar; isso não deve virar erro de hidratação. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Cabecalho />
        {children}
        <Rodape />
      </body>
    </html>
  );
}
