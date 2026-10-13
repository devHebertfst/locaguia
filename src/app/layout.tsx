import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cabecalho } from "@/components/cabecalho";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Cabecalho />
        {children}
      </body>
    </html>
  );
}
