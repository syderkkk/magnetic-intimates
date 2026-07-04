import type { Metadata } from "next";

import { LegalPage } from "@/components/shop/legal-page";

export const metadata: Metadata = {
  title: "Política de Envíos",
  description: "Zonas de cobertura, plazos y costos de envío de MAGNÉTIC.",
  alternates: { canonical: "/politica-envios" },
};

const UPDATED_AT = "3 de julio de 2026";

/**
 * TODO: confirmar con cliente — zonas y costos de envío exactos (decisión
 * pendiente #5, CLAUDE.md §1.1) y si habrá recojo en tienda (decisión #4).
 * El texto queda intencionalmente general hasta que se confirmen las tarifas.
 */
export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Política de Envíos"
      updatedAt={UPDATED_AT}
      sections={[
        {
          heading: "1. Cobertura",
          paragraphs: [
            "Hacemos envíos a todo el Perú. El costo y el tiempo de entrega dependen de tu distrito o ciudad; te los confirmamos durante el proceso de compra o al coordinar contigo por WhatsApp/correo.",
          ],
        },
        {
          heading: "2. Plazos de entrega",
          paragraphs: [
            "Los pedidos se despachan una vez confirmado el pago. Los tiempos de entrega estimados varían según tu ubicación: Lima Metropolitana entrega en 1 a 3 días hábiles; provincias, entre 3 y 7 días hábiles, dependiendo del operador logístico y la zona.",
          ],
        },
        {
          heading: "3. Costo de envío",
          paragraphs: [
            "El costo de envío se calcula según tu zona de entrega y se muestra antes de confirmar el pago. Te avisaremos con anticipación si aplica algún costo adicional.",
          ],
        },
        {
          heading: "4. Seguimiento",
          paragraphs: [
            "Una vez despachado tu pedido, te enviaremos la información de seguimiento correspondiente al correo registrado en tu compra.",
          ],
        },
        {
          heading: "5. Problemas con la entrega",
          paragraphs: [
            "Si tu pedido no llega en el plazo estimado o presenta algún problema, contáctanos desde nuestra página de Contacto y te ayudaremos a resolverlo.",
          ],
        },
      ]}
    />
  );
}
