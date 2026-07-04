import type { Metadata } from "next";

import { LegalPage } from "@/components/shop/legal-page";

export const metadata: Metadata = {
  title: "Política de Devoluciones y Cambios",
  description: "Condiciones para cambios y devoluciones en MAGNÉTIC.",
  alternates: { canonical: "/politica-devoluciones" },
};

const UPDATED_AT = "3 de julio de 2026";

export default function ReturnsPolicyPage() {
  return (
    <LegalPage
      title="Política de Devoluciones y Cambios"
      updatedAt={UPDATED_AT}
      sections={[
        {
          heading: "1. Cambios por talla",
          paragraphs: [
            "Si la talla no es la indicada, puedes solicitar un cambio dentro de los 7 días calendario posteriores a recibir tu pedido, siempre que la prenda esté sin uso, con sus etiquetas originales y en su empaque original.",
          ],
        },
        {
          heading: "2. Prendas que no aplican a cambio",
          paragraphs: [
            "Por razones de higiene, los productos íntimos (bodies, bralettes, tangas y similares) solo pueden cambiarse si presentan un defecto de fábrica, no por talla o preferencia, salvo que se indique lo contrario en la ficha del producto.",
          ],
        },
        {
          heading: "3. Cómo solicitar un cambio o devolución",
          paragraphs: [
            "Escríbenos desde nuestra página de Contacto indicando tu número de pedido y el motivo del cambio o devolución. Te indicaremos los siguientes pasos y, de aplicar, la dirección de envío.",
          ],
        },
        {
          heading: "4. Productos con defecto de fábrica",
          paragraphs: [
            "Si tu producto llegó con un defecto de fábrica, cubrimos el costo del cambio o la devolución. Contáctanos con fotos del defecto para agilizar el proceso.",
          ],
        },
        {
          heading: "5. Reembolsos",
          paragraphs: [
            "Cuando corresponda un reembolso (por ejemplo, falta de stock tras confirmar el pago), este se realiza por el mismo medio de pago utilizado en la compra, en un plazo razonable una vez validada la solicitud.",
          ],
        },
      ]}
    />
  );
}
