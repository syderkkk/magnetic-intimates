import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { argon2id, hash } from "argon2";

import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/** Slug simple para SKUs (sin acentos ni espacios). */
function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Paleta de marca (nombre + hex). */
const COLORS = [
  { name: "Negro", hex: "#0A0A0A" },
  { name: "Negro noche", hex: "#13131A" },
  { name: "Nude", hex: "#E7DCD3" },
  { name: "Perla", hex: "#EDE7E0" },
  { name: "Arena", hex: "#D8C7B5" },
  { name: "Rosa palo", hex: "#C9A7A1" },
  { name: "Vino", hex: "#7A2E3A" },
  { name: "Gris", hex: "#5B5B66" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "Único"];

const CATEGORIES = [
  { name: "Conjuntos", slug: "conjuntos" },
  { name: "Bodies", slug: "bodies" },
  { name: "Pijamas", slug: "pijamas" },
  { name: "Lencería", slug: "lenceria" },
  { name: "Accesorios", slug: "accesorios" },
];

interface SeedProduct {
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  compareAtPriceCents?: number;
  badge?: string;
  colors: string[]; // hex de la paleta
  sizes: string[];
  description: string;
  composition?: string;
  isFeatured: boolean;
  images: { seed: string; alt: string }[];
  /** Stock por combinación `${size}|${hex}`; el resto usa `defaultStock`. */
  stock?: Record<string, number>;
  defaultStock?: number;
}

const PRODUCTS: SeedProduct[] = [
  {
    slug: "conjunto-essential-negro",
    name: "Conjunto Essential",
    category: "Conjuntos",
    priceCents: 12900,
    compareAtPriceCents: 16900,
    badge: "oferta",
    colors: ["#0A0A0A", "#E7DCD3"],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Conjunto de top y calzón con acabado satinado. Tela suave y transpirable, diseño esencial para el día a día.",
    composition:
      "92% poliéster satinado, 8% elastano. Lavar a mano con agua fría, no usar lejía, secar a la sombra.",
    isFeatured: true,
    images: [
      { seed: "nue-essential-1", alt: "Conjunto Essential en negro, vista frontal" },
      { seed: "nue-essential-2", alt: "Conjunto Essential en negro, vista de detalle" },
    ],
    stock: {
      "XS|#0A0A0A": 12,
      "XS|#E7DCD3": 0,
      "S|#0A0A0A": 8,
      "S|#E7DCD3": 15,
      "M|#0A0A0A": 3,
      "M|#E7DCD3": 10,
      "L|#0A0A0A": 6,
      "L|#E7DCD3": 0,
    },
  },
  {
    slug: "body-seamless-marfil",
    name: "Body Seamless",
    category: "Bodies",
    priceCents: 8900,
    badge: "nuevo",
    colors: ["#E7DCD3", "#0A0A0A"],
    sizes: ["S", "M", "L"],
    description:
      "Body de tela seamless sin costuras visibles. Se adapta al cuerpo con elasticidad natural y comodidad todo el día.",
    isFeatured: true,
    defaultStock: 18,
    images: [
      { seed: "nue-body-1", alt: "Body Seamless en marfil, vista frontal" },
      { seed: "nue-body-2", alt: "Body Seamless en marfil, vista lateral" },
    ],
  },
  {
    slug: "pijama-satin-perla",
    name: "Pijama Satín",
    category: "Pijamas",
    priceCents: 15900,
    badge: "bestseller",
    colors: ["#EDE7E0", "#0A0A0A"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Set de dos piezas en satín de alta calidad. Pantalón de tiro alto y camisa con botones — elegancia para el descanso.",
    isFeatured: true,
    defaultStock: 12,
    images: [
      { seed: "nue-pijama-1", alt: "Pijama de satín en tono perla, vista frontal" },
      { seed: "nue-pijama-2", alt: "Pijama de satín en tono perla, vista de detalle" },
    ],
  },
  {
    slug: "sujetador-bralette-encaje",
    name: "Bralette de Encaje",
    category: "Lencería",
    priceCents: 6900,
    colors: ["#0A0A0A", "#7A2E3A"],
    sizes: ["S", "M", "L"],
    description:
      "Bralette de encaje floral con espalda cruzada. Tirantes ajustables y sin aros para máxima comodidad.",
    isFeatured: true,
    defaultStock: 20,
    images: [
      { seed: "nue-bralette-1", alt: "Bralette de encaje, vista frontal" },
      { seed: "nue-bralette-2", alt: "Bralette de encaje, vista de detalle" },
    ],
  },
  {
    slug: "slip-dress-midnight",
    name: "Slip Dress",
    category: "Conjuntos",
    priceCents: 18900,
    compareAtPriceCents: 22900,
    badge: "oferta",
    colors: ["#13131A", "#5B5B66"],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Vestido camisero en satín ligero con tirantes finos. Lleva solo como vestido o sobre una camiseta para un look más casual.",
    isFeatured: true,
    defaultStock: 9,
    images: [
      { seed: "nue-slip-1", alt: "Slip dress en tono medianoche, vista frontal" },
      { seed: "nue-slip-2", alt: "Slip dress en tono medianoche, vista de espalda" },
    ],
  },
  {
    slug: "tanga-algodon-pima",
    name: "Tanga Algodón Pima",
    category: "Lencería",
    priceCents: 3900,
    badge: "nuevo",
    colors: ["#E7DCD3", "#0A0A0A", "#C9A7A1"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Tanga de algodón pima peruano 100% natural. Suave, hipoalergénico y con corte cómodo que no marca bajo la ropa.",
    isFeatured: true,
    defaultStock: 30,
    images: [
      { seed: "nue-tanga-1", alt: "Tanga de algodón pima, vista frontal" },
      { seed: "nue-tanga-2", alt: "Tanga de algodón pima, vista de detalle" },
    ],
  },
  {
    slug: "kimono-corto-arena",
    name: "Kimono Corto",
    category: "Pijamas",
    priceCents: 13900,
    colors: ["#D8C7B5", "#0A0A0A"],
    sizes: ["Único"],
    description:
      "Kimono corto de seda vegetal con cinturón removible. Talla única con mangas 3/4 — perfecto como bata o capa ligera.",
    isFeatured: true,
    defaultStock: 14,
    images: [
      { seed: "nue-kimono-1", alt: "Kimono corto en tono arena, vista frontal" },
      { seed: "nue-kimono-2", alt: "Kimono corto en tono arena, vista de detalle" },
    ],
  },
  {
    slug: "set-medias-rib",
    name: "Set de Medias Rib",
    category: "Accesorios",
    priceCents: 4900,
    badge: "bestseller",
    colors: ["#0A0A0A", "#E7DCD3", "#5B5B66"],
    sizes: ["Único"],
    description:
      "Pack de 3 pares de medias acanaladas (rib) de algodón. Textura suave, elástico cómodo y colores neutros que combinan con todo.",
    isFeatured: true,
    defaultStock: 40,
    images: [
      { seed: "nue-medias-1", alt: "Set de medias rib, vista frontal" },
      { seed: "nue-medias-2", alt: "Set de medias rib, vista de detalle" },
    ],
  },
];

const SITE_SETTINGS = [
  { key: "site_name", value: "NUE INTIME", type: "string" },
  { key: "primary_color", value: "#0A0A0A", type: "color" },
  { key: "whatsapp", value: "", type: "string" },
  { key: "instagram", value: "https://instagram.com", type: "string" },
];

async function main() {
  // Limpieza idempotente (en orden seguro por claves foráneas).
  await db.productImage.deleteMany();
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.size.deleteMany();
  await db.color.deleteMany();
  await db.siteSetting.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  await db.role.deleteMany();

  // Roles
  const [adminRole] = await Promise.all([
    db.role.create({ data: { name: "admin", description: "Administrador" } }),
    db.role.create({ data: { name: "editor", description: "Editor de contenido" } }),
    db.role.create({ data: { name: "customer", description: "Cliente" } }),
  ]);

  // Usuario admin (argon2id)
  const passwordHash = await hash("Admin1234!", { type: argon2id });
  await db.user.create({
    data: {
      email: "admin@nue.pe",
      name: "Administrador",
      passwordHash,
      roleId: adminRole.id,
    },
  });

  // Tallas y colores
  await db.size.createMany({
    data: SIZES.map((name, position) => ({ name, position })),
  });
  await db.color.createMany({
    data: COLORS.map((c, position) => ({ name: c.name, hex: c.hex, position })),
  });

  const sizes = await db.size.findMany();
  const colors = await db.color.findMany();
  const sizeId = new Map(sizes.map((s) => [s.name, s.id]));
  const colorIdByHex = new Map(colors.map((c) => [c.hex, c.id]));
  const colorNameByHex = new Map(COLORS.map((c) => [c.hex, c.name]));

  // Categorías
  await db.category.createMany({
    data: CATEGORIES.map((c, position) => ({
      name: c.name,
      slug: c.slug,
      position,
    })),
  });
  const categories = await db.category.findMany();
  const categoryId = new Map(categories.map((c) => [c.name, c.id]));

  // Productos con imágenes y variantes
  for (const p of PRODUCTS) {
    const variants = [];
    for (const size of p.sizes) {
      for (const hex of p.colors) {
        const stock = p.stock?.[`${size}|${hex}`] ?? p.defaultStock ?? 15;
        variants.push({
          sku: `${p.slug}-${slug(size)}-${slug(colorNameByHex.get(hex) ?? hex)}`.toUpperCase(),
          stock,
          sizeId: sizeId.get(size)!,
          colorId: colorIdByHex.get(hex)!,
        });
      }
    }

    await db.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        composition: p.composition ?? null,
        priceCents: p.priceCents,
        compareAtPriceCents: p.compareAtPriceCents ?? null,
        badge: p.badge ?? null,
        categoryId: categoryId.get(p.category)!,
        isFeatured: p.isFeatured,
        // Sin imágenes: se suben desde el panel de administración.
        variants: {
          create: variants.map((v) => ({
            sku: v.sku,
            stock: v.stock,
            size: { connect: { id: v.sizeId } },
            color: { connect: { id: v.colorId } },
          })),
        },
      },
    });
  }

  // Configuración del sitio
  await db.siteSetting.createMany({ data: SITE_SETTINGS });

  const counts = {
    roles: await db.role.count(),
    users: await db.user.count(),
    categories: await db.category.count(),
    products: await db.product.count(),
    variants: await db.productVariant.count(),
  };
  console.log("Seed completado:", counts);
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
