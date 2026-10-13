import type { NextConfig } from "next";

// Fotos dos equipamentos vêm do Supabase Storage (bucket público).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      ...(supabaseUrl ? [new URL("/storage/v1/object/public/**", supabaseUrl)] : []),
      // Fotos de obra da home (Unsplash, licença livre). A query é fixa: só
      // estas versões das fotos podem passar pelo otimizador de imagens.
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*", search: "?w=2000&q=80&fm=jpg" },
    ],
  },
  // O catálogo saiu da home para /catalogo: links antigos com filtro
  // (/?busca=…, /?categoria=…) continuam funcionando. A query é mantida.
  async redirects() {
    return ["busca", "categoria"].map((chave) => ({
      source: "/",
      has: [{ type: "query" as const, key: chave }],
      destination: "/catalogo",
      permanent: true,
    }));
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
