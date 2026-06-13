import { AnnouncementBar } from "@/components/shop/announcement-bar";
import { SiteFooter } from "@/components/shop/site-footer";
import { SiteHeader } from "@/components/shop/site-header";

/**
 * Layout de la tienda pública: barra de anuncios, cabecera (navegación) y pie.
 * Envuelve todas las rutas del grupo (shop). El panel de administración tendrá
 * su propio grupo y layout aparte.
 */
export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
