import { AnnouncementBar } from "@/components/shop/announcement-bar";
import { SiteFooter } from "@/components/shop/site-footer";
import { SiteHeader } from "@/components/shop/site-header";
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
  const announcement = await getAnnouncement();

  return (
    <>
      <AnnouncementBar config={announcement} />
      <SiteHeader />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
