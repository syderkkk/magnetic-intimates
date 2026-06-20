import type { Product } from "@/types/product";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CATÁLOGO DE DEMOSTRACIÓN
 *  Datos de ejemplo para construir y probar la interfaz mientras no hay BD.
 *  Las imágenes son marcadores de posición (picsum.photos).
 *
 *  Cuando exista la base de datos, estas funciones (`getFeaturedProducts`,
 *  `getAllProducts`, `getProductBySlug`) se reemplazarán por consultas Prisma
 *  con el mismo tipo de retorno, sin tocar los componentes que las consumen.
 *  TODO: reemplazar por la capa de datos real (Prisma) cuando se cierre la BD.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Genera una URL de imagen de demostración con proporción retrato (4:5). */
function demoImage(seed: string): string {
  return `https://picsum.photos/seed/${seed}/800/1000`;
}

const products: Product[] = [
  {
    id: "p1",
    slug: "conjunto-essential-negro",
    name: "Conjunto Essential",
    category: "Conjuntos",
    priceCents: 12900,
    compareAtPriceCents: 16900,
    images: [
      { url: demoImage("nue-essential-1"), alt: "Conjunto Essential en negro, vista frontal" },
      { url: demoImage("nue-essential-2"), alt: "Conjunto Essential en negro, vista de detalle" },
    ],
    badge: "oferta",
    colors: ["#0A0A0A", "#E7DCD3"],
    sizes: ["XS", "S", "M", "L"],
    // Stock por variante (talla×color). Incluye una combinación agotada y otra
    // con pocas unidades para mostrar el comportamiento de la ficha.
    variants: [
      { sku: "NUE-ESS-XS-NEG", size: "XS", color: "#0A0A0A", stock: 12 },
      { sku: "NUE-ESS-XS-NUD", size: "XS", color: "#E7DCD3", stock: 0 },
      { sku: "NUE-ESS-S-NEG", size: "S", color: "#0A0A0A", stock: 8 },
      { sku: "NUE-ESS-S-NUD", size: "S", color: "#E7DCD3", stock: 15 },
      { sku: "NUE-ESS-M-NEG", size: "M", color: "#0A0A0A", stock: 3 },
      { sku: "NUE-ESS-M-NUD", size: "M", color: "#E7DCD3", stock: 10 },
      { sku: "NUE-ESS-L-NEG", size: "L", color: "#0A0A0A", stock: 6 },
      { sku: "NUE-ESS-L-NUD", size: "L", color: "#E7DCD3", stock: 0 },
    ],
    description: "Conjunto de top y calzón con acabado satinado. Tela suave y transpirable, diseño esencial para el día a día.",
    composition: "92% poliéster satinado, 8% elastano. Lavar a mano con agua fría, no usar lejía, secar a la sombra.",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "p2",
    slug: "body-seamless-marfil",
    name: "Body Seamless",
    category: "Bodies",
    priceCents: 8900,
    images: [
      { url: demoImage("nue-body-1"), alt: "Body Seamless en marfil, vista frontal" },
      { url: demoImage("nue-body-2"), alt: "Body Seamless en marfil, vista lateral" },
    ],
    badge: "nuevo",
    colors: ["#E7DCD3", "#0A0A0A"],
    sizes: ["S", "M", "L"],
    description: "Body de tela seamless sin costuras visibles. Se adapta al cuerpo con elasticidad natural y comodidad todo el día.",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "p3",
    slug: "pijama-satin-perla",
    name: "Pijama Satín",
    category: "Pijamas",
    priceCents: 15900,
    images: [
      { url: demoImage("nue-pijama-1"), alt: "Pijama de satín en tono perla, vista frontal" },
      { url: demoImage("nue-pijama-2"), alt: "Pijama de satín en tono perla, vista de detalle" },
    ],
    badge: "bestseller",
    colors: ["#EDE7E0", "#1B1B1B"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Set de dos piezas en satín de alta calidad. Pantalón de tiro alto y camisa con botones — elegancia para el descanso.",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "p4",
    slug: "sujetador-bralette-encaje",
    name: "Bralette de Encaje",
    category: "Lencería",
    priceCents: 6900,
    images: [
      { url: demoImage("nue-bralette-1"), alt: "Bralette de encaje, vista frontal" },
      { url: demoImage("nue-bralette-2"), alt: "Bralette de encaje, vista de detalle" },
    ],
    colors: ["#0A0A0A", "#7A2E3A"],
    sizes: ["S", "M", "L"],
    description: "Bralette de encaje floral con espalda cruzada. Tirantes ajustables y sin aros para máxima comodidad.",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "p5",
    slug: "slip-dress-midnight",
    name: "Slip Dress",
    category: "Conjuntos",
    priceCents: 18900,
    compareAtPriceCents: 22900,
    images: [
      { url: demoImage("nue-slip-1"), alt: "Slip dress en tono medianoche, vista frontal" },
      { url: demoImage("nue-slip-2"), alt: "Slip dress en tono medianoche, vista de espalda" },
    ],
    badge: "oferta",
    colors: ["#13131A", "#5B5B66"],
    sizes: ["XS", "S", "M", "L"],
    description: "Vestido camisero en satín ligero con tirantes finos. Lleva solo como vestido o sobre una camiseta para un look más casual.",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "p6",
    slug: "tanga-algodon-pima",
    name: "Tanga Algodón Pima",
    category: "Lencería",
    priceCents: 3900,
    images: [
      { url: demoImage("nue-tanga-1"), alt: "Tanga de algodón pima, vista frontal" },
      { url: demoImage("nue-tanga-2"), alt: "Tanga de algodón pima, vista de detalle" },
    ],
    badge: "nuevo",
    colors: ["#E7DCD3", "#0A0A0A", "#C9A7A1"],
    sizes: ["S", "M", "L", "XL"],
    description: "Tanga de algodón pima peruano 100% natural. Suave, hipoalergénico y con corte cómodo que no marca bajo la ropa.",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "p7",
    slug: "kimono-corto-arena",
    name: "Kimono Corto",
    category: "Pijamas",
    priceCents: 13900,
    images: [
      { url: demoImage("nue-kimono-1"), alt: "Kimono corto en tono arena, vista frontal" },
      { url: demoImage("nue-kimono-2"), alt: "Kimono corto en tono arena, vista de detalle" },
    ],
    colors: ["#D8C7B5", "#0A0A0A"],
    sizes: ["Único"],
    description: "Kimono corto de seda vegetal con cinturón removible. Talla única con mangas 3/4 — perfecto como bata o capa ligera.",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "p8",
    slug: "set-medias-rib",
    name: "Set de Medias Rib",
    category: "Accesorios",
    priceCents: 4900,
    images: [
      { url: demoImage("nue-medias-1"), alt: "Set de medias rib, vista frontal" },
      { url: demoImage("nue-medias-2"), alt: "Set de medias rib, vista de detalle" },
    ],
    badge: "bestseller",
    colors: ["#0A0A0A", "#E7DCD3", "#8A8A8A"],
    sizes: ["Único"],
    description: "Pack de 3 pares de medias acanaladas (rib) de algodón. Textura suave, elástico cómodo y colores neutros que combinan con todo.",
    isActive: true,
    isFeatured: true,
  },
];

/** Devuelve todos los productos activos. */
export function getAllProducts(): Product[] {
  return products.filter((product) => product.isActive);
}

/** Devuelve los productos destacados para la página de inicio. */
export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.isActive && product.isFeatured);
}

/** Busca un producto por su slug (o `undefined` si no existe / está inactivo). */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.isActive && product.slug === slug);
}
