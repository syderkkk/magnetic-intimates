import { AnnouncementBar } from "@/components/shop/announcement-bar";
import { SiteFooter } from "@/components/shop/site-footer";
import { SiteHeader } from "@/components/shop/site-header";
import { WhatsAppButton } from "@/components/shop/whatsapp-button";
import { slugify } from "@/lib/data/filters";
import { db } from "@/lib/db";
import { getAnnouncement } from "@/lib/site-settings";

/**
 * Layout de la tienda pública: barra de anuncios, cabecera (navegación) y pie.
 * Envuelve todas las rutas del grupo (shop). La cinta de anuncios se administra
 * desde el panel (Apariencia) y se lee aquí desde la BD.
 */
export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [announcement, categories] = await Promise.all([
    getAnnouncement(),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
      select: { name: true },
    }),
  ]);

  // Para el desplegable "Tienda" del header (categorías → /tienda?cat=slug).
  const navCategories = categories.map((c) => ({
    name: c.name,
    slug: slugify(c.name),
  }));

  return (
    <>
      <AnnouncementBar config={announcement} />
      <SiteHeader categories={navCategories} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
