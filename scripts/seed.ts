// Cadastra equipamentos de exemplo para desenvolvimento. Não roda se já
// existir algum equipamento, para nunca misturar com dados reais.
// Uso: npm run db:seed
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { equipamentos } from "../src/db/schema";

config({ path: [".env.local", ".env"], quiet: true });

const exemplos: (typeof equipamentos.$inferInsert)[] = [
  { nome: "Betoneira 400 litros", categoria: "Concretagem", descricao: "Betoneira elétrica monofásica para preparo de concreto e argamassa em obras pequenas e médias." },
  { nome: "Vibrador de concreto", categoria: "Concretagem", descricao: "Vibrador de imersão com mangote de 35 mm para adensar concreto em lajes, vigas e pilares." },
  { nome: "Martelete rompedor 10 kg", categoria: "Demolição", descricao: "Rompedor elétrico para quebrar pisos, paredes e concreto. Acompanha ponteiro e talhadeira." },
  { nome: "Furadeira de impacto", categoria: "Perfuração", descricao: "Furadeira de impacto 750 W para alvenaria, madeira e metal." },
  { nome: "Serra mármore", categoria: "Corte", descricao: "Serra mármore 1.400 W para cortar pisos, azulejos, porcelanato e pedras. Disco diamantado incluso." },
  { nome: "Cortadora de piso", categoria: "Corte", descricao: "Cortadora manual de 75 cm para cerâmica e porcelanato." },
  { nome: "Andaime tubular (módulo 1,5 m)", categoria: "Acesso e altura", descricao: "Módulo de andaime tubular com piso metálico e travas. Vários módulos podem ser montados juntos." },
  { nome: "Escada extensível 7 m", categoria: "Acesso e altura", descricao: "Escada de alumínio extensível de 4 a 7 metros." },
  { nome: "Placa vibratória", categoria: "Compactação", descricao: "Compactador de solo a gasolina para pisos, calçadas e bases de pavimentação.", disponivel: false },
  { nome: "Compactador de percussão (sapo)", categoria: "Compactação", descricao: "Compactador de solo para valas e áreas pequenas." },
  { nome: "Lixadeira de parede", categoria: "Acabamento", descricao: "Lixadeira de parede e teto com cabo extensível, para massa corrida e gesso." },
  { nome: "Lavadora de alta pressão", categoria: "Limpeza", descricao: "Lavadora 2.000 psi para limpeza de pisos, fachadas e calçadas.", disponivel: false },
  { nome: "Gerador a gasolina 5 kVA", categoria: "Energia", descricao: "Gerador portátil para obras sem energia elétrica." },
  { nome: "Carrinho de mão", categoria: "Transporte", descricao: "Carrinho de mão com caçamba metálica de 90 litros e pneu com câmara." },
];

async function main() {
  const url = process.env.DATABASE_URL_DIRETA ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida (.env.local)");
  const conexao = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(conexao);
  try {
    const existentes = await db.$count(equipamentos);
    if (existentes > 0) {
      console.log(`Já existem ${existentes} equipamentos; nada a fazer.`);
      return;
    }
    await db.insert(equipamentos).values(exemplos);
    console.log(`${exemplos.length} equipamentos de exemplo cadastrados.`);
  } finally {
    await conexao.end();
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
