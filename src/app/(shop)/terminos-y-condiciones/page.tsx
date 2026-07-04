import type { Metadata } from "next";

import { LegalPage } from "@/components/shop/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Condiciones de uso y compra en MAGNÉTIC.",
  alternates: { canonical: "/terminos-y-condiciones" },
};

const UPDATED_AT = "3 de julio de 2026";

/**
 * TODO: confirmar con cliente — tratamiento del IGV (decisión pendiente #2,
 * CLAUDE.md §1.1) antes de afirmar si los precios lo incluyen o no; hoy el
 * texto queda neutral a propósito.
 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Términos y Condiciones"
      updatedAt={UPDATED_AT}
      sections={[
        {
          heading: "1. Aceptación",
          paragraphs: [
            `Al usar este sitio y realizar una compra en ${siteConfig.name}, aceptas los presentes Términos y Condiciones. Si no estás de acuerdo con ellos, te pedimos no utilizar el sitio.`,
          ],
        },
        {
          heading: "2. Productos y precios",
          paragraphs: [
            "Los precios se muestran en Soles peruanos (S/) y pueden actualizarse sin previo aviso; el precio vigente es el que se muestra al momento de confirmar tu pedido, no el que aparecía al agregarlo al carrito.",
            "Trabajamos con disponibilidad real de stock por talla y color. Si un producto se agota durante el proceso de compra, te lo indicaremos antes de cobrar.",
          ],
        },
        {
          heading: "3. Proceso de compra y pago",
          paragraphs: [
            "El pedido se confirma solo cuando el pago es aprobado por nuestra pasarela de pagos, Izipay. Mientras el pago esté pendiente, el pedido no se considera confirmado.",
            "Los datos de tu tarjeta se procesan directamente por Izipay bajo los estándares de seguridad de la industria; no los almacenamos en nuestros servidores.",
          ],
        },
        {
          heading: "4. Envíos y entregas",
          paragraphs: [
            "Consulta los plazos, zonas de cobertura y costos vigentes en nuestra Política de Envíos.",
          ],
        },
        {
          heading: "5. Cambios y devoluciones",
          paragraphs: [
            "Consulta las condiciones aplicables en nuestra Política de Devoluciones y Cambios.",
          ],
        },
        {
          heading: "6. Propiedad intelectual",
          paragraphs: [
            `Todo el contenido de este sitio (textos, imágenes, logotipos, diseño) es propiedad de ${siteConfig.name} o de sus licenciantes y está protegido por las leyes de propiedad intelectual. No está permitido reproducirlo sin autorización.`,
          ],
        },
        {
          heading: "7. Modificaciones",
          paragraphs: [
            "Podemos actualizar estos Términos y Condiciones en cualquier momento; la versión vigente es la publicada en esta página.",
          ],
        },
        {
          heading: "8. Libro de Reclamaciones",
          paragraphs: [
            "Como consumidor, tienes derecho a registrar un reclamo o queja en nuestro Libro de Reclamaciones virtual, disponible en todo momento en este sitio.",
          ],
        },
      ]}
    />
  );
}
